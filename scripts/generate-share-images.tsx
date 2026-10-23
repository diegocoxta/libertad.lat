// Writes the files the site serves from public/ before `next build`: an Instagram story (1080x1920)
// per locale and country, offered for download on the country pages, a link preview (1200x630) per
// page for the Open Graph tags, and the two large drawings (the seal artwork, as a picture, and the
// footer map) that pages load as files instead of repeating them in every HTML. It skips the work
// when none of its inputs changed.
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg, renderAsync } from '@resvg/resvg-js';
import sharp from 'sharp';

import { CondorHarpyEagle, SEAL_ART_PATH } from '~/components/condor-harpy-eagle';
import { ART_VIEWBOX, CondorHarpyEagleArt } from '~/components/condor-harpy-eagle-art';
import { InvertedAmerica } from '~/components/inverted-america';
import { OFFENSIVE_2026 } from '~/content/offensive-2026';
import { COUNTRY_CODES, getCountrySlug, type CountryCode } from '~/lib/countries';
import { LOCALES, getTranslations, type Locale } from '~/lib/i18n';
import { getOgImagePath, getShareHeadline, getSharePath } from '~/lib/share';
import { SITE_DISPLAY_HOST } from '~/lib/site';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_DIRS = ['share', 'og'].map((dir) => path.join(PUBLIC_DIR, dir));
const HASH_FILE = path.join(ROOT, 'node_modules/.cache/share-images.hash');
const FONT_DIR = path.join(ROOT, 'node_modules/geist/dist/fonts/geist-sans');
const FLAG_DIR = path.join(ROOT, 'node_modules/country-flag-icons/3x2');

const FONT = {
  fontFiles: ['Geist-Regular.ttf', 'Geist-Bold.ttf', 'Geist-Black.ttf'].map((file) => path.join(FONT_DIR, file)),
  loadSystemFonts: false,
  defaultFontFamily: 'Geist',
};

const BACKGROUND = '#d23336';
const MAP_PATH = '/inverted-america.svg';

// Instagram covers the top and the bottom of a story with its own interface.
const STORY = { width: 1080, height: 1920, textWidth: 900, safeMargin: 260 };
const STORY_LEAD = { size: 56, weight: 700, spacing: 3.5, lineHeight: 72 };
const STORY_PLACE = { maxSize: 168, weight: 900, spacing: 2 };

const PREVIEW = { width: 1200, height: 630, seal: 430, columnX: 600, columnWidth: 540 };
const PREVIEW_LEAD = { size: 34, weight: 700, spacing: 2.4, lineHeight: 46 };
const PREVIEW_PLACE = { maxSize: 100, weight: 900, spacing: 1.5 };

const STORY_URL = { size: 38, weight: 700, spacing: 2, lineHeight: 52 };
const PREVIEW_URL = { size: 24, weight: 700, spacing: 1.5, lineHeight: 34 };

const INPUTS = [
  'scripts/generate-share-images.tsx',
  'lib/share.ts',
  'lib/countries.ts',
  'lib/site.ts',
  'components/condor-harpy-eagle.tsx',
  'components/condor-harpy-eagle-art.tsx',
  'components/condor-harpy-eagle-layers.ts',
  'components/inverted-america.tsx',
  'content/offensive-2026.ts',
  ...LOCALES.map((locale) => `lib/i18n/translations/${locale}.json`),
  'node_modules/geist/package.json',
  'node_modules/country-flag-icons/package.json',
  'node_modules/@resvg/resvg-js/package.json',
];

type TextStyleType = {
  size: number;
  weight: number;
  spacing: number;
  lineHeight: number;
};

type PlaceStyleType = {
  maxSize: number;
  weight: number;
  spacing: number;
};

type PlaceLayoutType = {
  lines: string[];
  size: number;
};

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function measure(text: string, size: number, weight: number, spacing: number): number {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="${size * 2}"><text x="0" y="${size}" font-family="Geist" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}">${escapeXml(text)}</text></svg>`;

  return new Resvg(svg, { font: FONT }).getBBox()?.width ?? 0;
}

function wrap(words: string[], maxWidth: number, style: TextStyleType): string[] {
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;

    if (line && measure(next, style.size, style.weight, style.spacing) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  return line ? [...lines, line] : lines;
}

// Narrowest width that keeps the line count, so the lines come out about the same length.
function wrapBalanced(text: string, maxWidth: number, style: TextStyleType): string[] {
  const words = text.split(' ');
  const greedy = wrap(words, maxWidth, style);
  let low = Math.max(...words.map((word) => measure(word, style.size, style.weight, style.spacing)));
  let high = maxWidth;

  while (high - low > 8) {
    const middle = (low + high) / 2;

    if (wrap(words, middle, style).length <= greedy.length) {
      high = middle;
    } else {
      low = middle;
    }
  }

  return wrap(words, high, style);
}

const wrapCache = new Map<string, string[]>();

function layoutLines(text: string, maxWidth: number, style: TextStyleType): string[] {
  const key = `${text}|${maxWidth}|${style.size}|${style.weight}`;
  const cached = wrapCache.get(key);

  if (cached) {
    return cached;
  }

  const lines = wrapBalanced(text, maxWidth, style);

  wrapCache.set(key, lines);

  return lines;
}

// Largest size at which every line fits, counting the letter spacing separately because it does not scale.
function fitSize(lines: string[], maxWidth: number, style: PlaceStyleType): number {
  return Math.min(
    style.maxSize,
    ...lines.map((line) => {
      const glyphs = measure(line, 100, style.weight, 0);

      return Math.floor(((maxWidth - style.spacing * (line.length - 1)) * 100) / glyphs);
    }),
  );
}

function splitInTwo(text: string, weight: number): string[] {
  const words = text.split(' ');
  let best = [text];
  let bestWidth = Infinity;

  for (let index = 1; index < words.length; index += 1) {
    const lines = [words.slice(0, index).join(' '), words.slice(index).join(' ')];
    const widest = Math.max(...lines.map((line) => measure(line, 100, weight, 0)));

    if (widest < bestWidth) {
      best = lines;
      bestWidth = widest;
    }
  }

  return best;
}

// The place goes on one line when it stays large enough, otherwise on two.
function layoutPlace(place: string, maxWidth: number, style: PlaceStyleType, minSize: number): PlaceLayoutType {
  const single = { lines: [place], size: fitSize([place], maxWidth, style) };

  if (single.size >= minSize || !place.includes(' ')) {
    return single;
  }

  const lines = splitInTwo(place, style.weight);
  const size = fitSize(lines, maxWidth, style);

  return size > single.size * 1.25 ? { lines, size } : single;
}

// A word cannot be wrapped, so the heading shrinks until its longest word fits.
function fitHeadingStyle(text: string, maxWidth: number, style: TextStyleType): TextStyleType {
  const words = text.split(' ');
  let size = style.size;

  while (size > 24 && Math.max(...words.map((word) => measure(word, size, style.weight, style.spacing))) > maxWidth) {
    size -= 2;
  }

  return { ...style, size, lineHeight: Math.round((style.lineHeight * size) / style.size) };
}

function placeTextStyle(layout: PlaceLayoutType, style: PlaceStyleType): TextStyleType {
  return { size: layout.size, weight: style.weight, spacing: style.spacing, lineHeight: Math.round(layout.size * 1.05) };
}

function drawLines(lines: string[], style: TextStyleType, centerX: number, top: number): string {
  return lines
    .map((line, index) => {
      const baseline = top + index * style.lineHeight + style.lineHeight * 0.5 + style.size * 0.355;

      return `<text font-family="Geist" x="${centerX + style.spacing / 2}" y="${baseline}" font-size="${style.size}" font-weight="${style.weight}" letter-spacing="${style.spacing}" text-anchor="middle" fill="#FFFFFF">${escapeXml(line)}</text>`;
    })
    .join('\n');
}

function drawSeal(locale: Locale, x: number, y: number, size: number): string {
  const t = getTranslations(locale);

  return renderToStaticMarkup(
    <CondorHarpyEagle
      topText={t('page.joke').toLocaleUpperCase(locale)}
      bottomText={t('page.title').toLocaleUpperCase(locale)}
      x={x}
      y={y}
      width={size}
      height={size}
      fontFamily="Geist"
      inlineArt
    />,
  );
}

async function drawFlag(code: CountryCode, x: number, y: number, width: number): Promise<string> {
  const height = (width * 2) / 3;
  const radius = Math.round(width / 30);
  const flag = await readFile(path.join(FLAG_DIR, `${code}.svg`));

  return `<rect x="${x - 8}" y="${y - 8}" width="${width + 16}" height="${height + 16}" rx="${radius + 8}" fill="#FFFFFF"/>
<clipPath id="flag-clip"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/></clipPath>
<image href="data:image/svg+xml;base64,${flag.toString('base64')}" x="${x}" y="${y}" width="${width}" height="${height}" clip-path="url(#flag-clip)"/>`;
}

function drawFrame(width: number, height: number, inset: number, radius: number): string {
  return `<rect x="${inset}" y="${inset}" width="${width - 2 * inset}" height="${height - 2 * inset}" rx="${radius}" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="3"/>`;
}

async function renderPng(svg: string, width: number): Promise<Uint8Array> {
  const image = await renderAsync(svg, { font: FONT, fitTo: { mode: 'width', value: width } });

  return image.asPng();
}

async function drawStory(locale: Locale, code: CountryCode): Promise<Uint8Array> {
  const { width, height, textWidth, safeMargin } = STORY;
  const { lead, place, tail } = getShareHeadline(locale, code);
  const leadLines = layoutLines(lead, textWidth, STORY_LEAD);
  const tailLines = tail ? layoutLines(tail, textWidth, STORY_LEAD) : [];
  const placeLayout = layoutPlace(place, textWidth, STORY_PLACE, 96);
  const placeStyle = placeTextStyle(placeLayout, STORY_PLACE);

  const leadHeight = leadLines.length * STORY_LEAD.lineHeight;
  const placeHeight = placeLayout.lines.length * placeStyle.lineHeight;
  const tailHeight = tailLines.length ? 14 + tailLines.length * STORY_LEAD.lineHeight : 0;
  const textHeight = leadHeight + 24 + placeHeight + tailHeight;
  const compact = textHeight > 400;
  const flagWidth = compact ? 340 : 400;
  const flagHeight = (flagWidth * 2) / 3;
  const gap = compact ? 56 : 84;
  const urlGap = compact ? 40 : 52;
  const urlHeight = urlGap + STORY_URL.lineHeight;
  const sealSize = Math.min(560, height - 2 * safeMargin - textHeight - flagHeight - 2 * gap - urlHeight);
  const stackHeight = sealSize + gap + textHeight + gap + flagHeight + urlHeight;

  const sealY = Math.round((height - stackHeight) / 2);
  const leadY = sealY + sealSize + gap;
  const placeY = leadY + leadHeight + 24;
  const tailY = placeY + placeHeight + 14;
  const flagY = leadY + textHeight + gap;
  const urlY = flagY + flagHeight + urlGap;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
${drawFrame(width, height, 40, 32)}
${drawSeal(locale, (width - sealSize) / 2, sealY, sealSize)}
${drawLines(leadLines, STORY_LEAD, width / 2, leadY)}
${drawLines(placeLayout.lines, placeStyle, width / 2, placeY)}
${drawLines(tailLines, STORY_LEAD, width / 2, tailY)}
${await drawFlag(code, (width - flagWidth) / 2, flagY, flagWidth)}
${drawLines([SITE_DISPLAY_HOST], STORY_URL, width / 2, urlY)}
</svg>`;

  return renderPng(svg, width);
}

type PreviewType = { kind: 'home' } | { kind: 'article' } | { kind: 'country'; code: CountryCode };

async function drawCountryColumn(locale: Locale, code: CountryCode, centerX: number): Promise<string> {
  const { height, columnWidth } = PREVIEW;
  const { lead, place, tail } = getShareHeadline(locale, code);
  const leadLines = layoutLines(lead, columnWidth, PREVIEW_LEAD);
  const tailLines = tail ? layoutLines(tail, columnWidth, PREVIEW_LEAD) : [];
  const placeLayout = layoutPlace(place, columnWidth, PREVIEW_PLACE, 56);
  const placeStyle = placeTextStyle(placeLayout, PREVIEW_PLACE);

  const flagWidth = 216;
  const flagHeight = (flagWidth * 2) / 3;
  const leadHeight = leadLines.length * PREVIEW_LEAD.lineHeight;
  const placeHeight = placeLayout.lines.length * placeStyle.lineHeight;
  const tailHeight = tailLines.length ? 10 + tailLines.length * PREVIEW_LEAD.lineHeight : 0;
  const columnHeight = leadHeight + 14 + placeHeight + tailHeight + 36 + flagHeight + 28 + PREVIEW_URL.lineHeight;

  const leadY = Math.round((height - columnHeight) / 2);
  const placeY = leadY + leadHeight + 14;
  const tailY = placeY + placeHeight + 10;
  const flagY = placeY + placeHeight + tailHeight + 36;
  const urlY = flagY + flagHeight + 28;

  return [
    drawLines(leadLines, PREVIEW_LEAD, centerX, leadY),
    drawLines(placeLayout.lines, placeStyle, centerX, placeY),
    drawLines(tailLines, PREVIEW_LEAD, centerX, tailY),
    await drawFlag(code, centerX - flagWidth / 2, flagY, flagWidth),
    drawLines([SITE_DISPLAY_HOST], PREVIEW_URL, centerX, urlY),
  ].join('\n');
}

function drawTitleColumn(locale: Locale, kind: 'home' | 'article', centerX: number): string {
  const { height, columnWidth } = PREVIEW;
  const t = getTranslations(locale);
  const heading = (kind === 'home' ? t('page.title') : OFFENSIVE_2026.title[locale]).toLocaleUpperCase(locale);
  const headingStyle = fitHeadingStyle(
    heading,
    columnWidth,
    kind === 'home'
      ? { size: 60, weight: 900, spacing: 2, lineHeight: 70 }
      : { size: 44, weight: 900, spacing: 1.5, lineHeight: 56 },
  );
  const subtitleStyle: TextStyleType = { size: 28, weight: 700, spacing: 2, lineHeight: 40 };

  const headingLines = layoutLines(heading, columnWidth, headingStyle);
  const subtitleLines = kind === 'home' ? layoutLines(t('page.soon').toLocaleUpperCase(locale), columnWidth, subtitleStyle) : [];
  const headingHeight = headingLines.length * headingStyle.lineHeight;
  const subtitleHeight = subtitleLines.length ? 24 + subtitleLines.length * subtitleStyle.lineHeight : 0;
  const urlGap = 40;
  const top = Math.round((height - headingHeight - subtitleHeight - urlGap - PREVIEW_URL.lineHeight) / 2);

  return [
    drawLines(headingLines, headingStyle, centerX, top),
    drawLines(subtitleLines, subtitleStyle, centerX, top + headingHeight + 24),
    drawLines([SITE_DISPLAY_HOST], PREVIEW_URL, centerX, top + headingHeight + subtitleHeight + urlGap),
  ].join('\n');
}

async function drawPreview(locale: Locale, preview: PreviewType): Promise<Uint8Array> {
  const { width, height, seal, columnX, columnWidth } = PREVIEW;
  const centerX = columnX + columnWidth / 2;
  const column =
    preview.kind === 'country'
      ? await drawCountryColumn(locale, preview.code, centerX)
      : drawTitleColumn(locale, preview.kind, centerX);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
${drawFrame(width, height, 24, 24)}
${drawSeal(locale, 64, (height - seal) / 2, seal)}
${column}
</svg>`;

  return renderPng(svg, width);
}

// Three times the 192px the artwork takes in the seal, for the sharpest phone screens.
const ART_WIDTH = 576;

async function writeSharedFiles() {
  const art = renderToStaticMarkup(<CondorHarpyEagleArt />);
  const map = renderToStaticMarkup(
    <InvertedAmerica xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" stroke="#FFFFFF" />,
  );
  const png = await renderPng(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ART_VIEWBOX}">${art}</svg>`,
    ART_WIDTH,
  );

  await writeFile(
    path.join(PUBLIC_DIR, SEAL_ART_PATH),
    await sharp(png).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer(),
  );
  await writeFile(path.join(PUBLIC_DIR, MAP_PATH), map);
}

async function hashInputs(): Promise<string> {
  const hash = createHash('sha256');

  for (const input of INPUTS) {
    hash.update(await readFile(path.join(ROOT, input)));
  }

  hash.update(SITE_DISPLAY_HOST);

  return hash.digest('hex');
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

async function countImages(): Promise<number> {
  let total = 0;

  for (const dir of OUTPUT_DIRS) {
    for (const locale of LOCALES) {
      try {
        total += (await readdir(path.join(dir, locale))).filter((file) => file.endsWith('.png')).length;
      } catch {
        // The folder does not exist yet.
      }
    }
  }

  return total;
}

type JobType = {
  file: string;
  draw: () => Promise<Uint8Array>;
};

function createJobs(): JobType[] {
  const jobs: JobType[] = [];

  for (const locale of LOCALES) {
    jobs.push(
      { file: getOgImagePath(locale, 'home'), draw: () => drawPreview(locale, { kind: 'home' }) },
      { file: getOgImagePath(locale, '2026'), draw: () => drawPreview(locale, { kind: 'article' }) },
    );

    for (const code of COUNTRY_CODES) {
      jobs.push(
        { file: getSharePath(locale, code), draw: () => drawStory(locale, code) },
        {
          file: getOgImagePath(locale, getCountrySlug(code)),
          draw: () => drawPreview(locale, { kind: 'country', code }),
        },
      );
    }
  }

  return jobs;
}

async function main() {
  const hash = await hashInputs();
  const jobs = createJobs();

  const filesExist = (await readIfExists(path.join(PUBLIC_DIR, SEAL_ART_PATH))) !== null && (await readIfExists(path.join(PUBLIC_DIR, MAP_PATH))) !== null;

  if (
    !process.argv.includes('--force') &&
    filesExist &&
    (await readIfExists(HASH_FILE)) === hash &&
    (await countImages()) === jobs.length
  ) {
    console.log(`Share images are up to date (${jobs.length}).`);

    return;
  }

  const startedAt = Date.now();

  await Promise.all(OUTPUT_DIRS.map((dir) => rm(dir, { recursive: true, force: true })));
  await writeSharedFiles();

  for (let index = 0; index < jobs.length; index += 8) {
    await Promise.all(
      jobs.slice(index, index + 8).map(async ({ file, draw }) => {
        const target = path.join(PUBLIC_DIR, file);

        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, await draw());
      }),
    );
  }

  await mkdir(path.dirname(HASH_FILE), { recursive: true });
  await writeFile(HASH_FILE, hash);

  console.log(`Generated ${jobs.length} images in ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
