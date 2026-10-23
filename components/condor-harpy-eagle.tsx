import type { SVGProps } from "react";

import { ART_VIEWBOX, CondorHarpyEagleArt } from "~/components/condor-harpy-eagle-art";

export const SEAL_ART_PATH = "/seal-art.webp";

const STAR = "M0 -8L1.88 -2.59L7.61 -2.47L3.04 .99L4.7 6.47L0 3.2L-4.7 6.47L-3.04 .99L-7.61 -2.47L-1.88 -2.59Z";

type CondorHarpyEagleProps = SVGProps<SVGSVGElement> & {
  topText: string;
  bottomText: string;
  inlineArt?: boolean;
};

// Draws a seal with fixed element ids, so render it once per page. The artwork is a picture shared
// by every page instead of being repeated in each one: drawing its vector paths takes the browser
// far longer than decoding a picture. The image renderer cannot load files, so it asks for the
// inline vector copy.
export function CondorHarpyEagle({ topText, bottomText, inlineArt = false, ...props }: CondorHarpyEagleProps) {
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <path id="seal-top" d="M 35 150 a 115 115 0 1 1 230 0" />
        <clipPath id="seal-clip">
          <circle cx="150" cy="150" r="99" />
        </clipPath>
        <path id="seal-bottom" d="M 25 150 a 125 125 0 0 0 250 0" />
      </defs>

      <circle cx="150" cy="150" r="140" fill="#041E42" stroke="#D4AF37" strokeWidth={4} />
      <circle cx="150" cy="150" r="100" fill="#FFFFFF" stroke="#D4AF37" strokeWidth={2} />

      <g clipPath="url(#seal-clip)">
        {inlineArt ? (
          <svg x="54" y="72" width="192" height="157" viewBox={ART_VIEWBOX}>
            <CondorHarpyEagleArt />
          </svg>
        ) : (
          <image href={SEAL_ART_PATH} x="54" y="72" width="192" height="157" />
        )}
      </g>

      <g fill="#FFFFFF" fontSize={14} fontWeight={700} letterSpacing={1.5} textAnchor="middle">
        <text>
          <textPath href="#seal-top" startOffset="50%">
            {topText}
          </textPath>
        </text>{" "}
        <text>
          <textPath href="#seal-bottom" startOffset="50%">
            {bottomText}
          </textPath>
        </text>
      </g>

      <path d={STAR} fill="#FFFFFF" transform="translate(35 150)" />
      <path d={STAR} fill="#FFFFFF" transform="translate(265 150)" />
    </svg>
  );
}
