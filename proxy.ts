import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getCountrySlug, parseCountrySlug, parseLegacyCountrySlug } from '~/lib/countries';
import { DEFAULT_LOCALE, isSupportedLocale, negotiateLocale } from '~/lib/i18n/locale';

const LOCALE_SHAPED = /^[a-z]{2}(-[a-z]{2})?$/i;

// Countries that get an empty 404 on everything, files included. Vercel sends the visitor's country in this header.
const BLOCKED_COUNTRIES = ['US'];
const COUNTRY_HEADER = 'x-vercel-ip-country';
// Google's crawlers are the one exception. The user agent can be faked, so this only keeps honest crawlers out of
// the block; a firewall rule on Vercel's verified bots is what makes it strict.
const ALLOWED_CRAWLERS = /Googlebot|Google-InspectionTool/i;
// Files and framework assets are not pages, so they only go through the country check.
const ASSET = /^\/(api|_next\/(static|image))(\/|$)|\.[^/]+$/;

function isPage(slug: string): boolean {
  return slug === 'sitemap' || parseCountrySlug(slug) !== null;
}

// A page that fails after it started streaming cannot change its status anymore, so a 404 is sent to a
// path no route matches (three segments), which answers 404 with app/global-not-found.tsx.
function notFound(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/not-found/404/404';

  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const blocked = BLOCKED_COUNTRIES.includes(request.headers.get(COUNTRY_HEADER) ?? '');

  if (blocked && !ALLOWED_CRAWLERS.test(request.headers.get('user-agent') ?? '')) {
    // Nothing that says a site is here: no page, no body. The same address answers differently by country,
    // so no shared cache may keep this answer.
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  if (ASSET.test(pathname)) {
    return NextResponse.next();
  }

  const [, segment, ...path] = pathname.split('/');
  const url = request.nextUrl.clone();

  if (isSupportedLocale(segment)) {
    const parts = path.filter(Boolean);

    if (parts.length === 0 || (parts.length === 1 && isPage(parts[0]))) {
      return NextResponse.next();
    }

    const legacy = parts.length === 1 ? parseLegacyCountrySlug(parts[0]) : null;

    if (legacy) {
      url.pathname = `/${segment}/${getCountrySlug(legacy)}`;

      return NextResponse.redirect(url, 308);
    }

    // Wrong letter case is the same page under another address.
    if (parts.length === 1 && isPage(parts[0].toLowerCase())) {
      url.pathname = `/${segment}/${parts[0].toLowerCase()}`;

      return NextResponse.redirect(url, 308);
    }

    return notFound(request);
  }

  if (LOCALE_SHAPED.test(segment)) {
    url.pathname = `/${DEFAULT_LOCALE}${pathname.slice(segment.length + 1)}`;

    return NextResponse.redirect(url);
  }

  const locale = negotiateLocale(request.headers.get('accept-language'));

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url);
}

// The matcher has to be literal, so the country here repeats BLOCKED_COUNTRIES.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)',
    // Requests from blocked countries also pass through for files and assets, which the rule above skips.
    { source: '/:path*', has: [{ type: 'header', key: 'x-vercel-ip-country', value: 'US' }] },
  ],
};
