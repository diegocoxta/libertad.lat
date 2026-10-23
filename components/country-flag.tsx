import type { ComponentProps } from 'react';
import { AR, BO, BR, CL, CO, CU, DO, EC, GT, GY, HN, HT, MX, NI, PA, PE, PR, PY, SV, UY, VE } from 'country-flag-icons/react/3x2';

import type { CountryCode } from '~/lib/countries';

const FLAGS: Record<CountryCode, typeof AR> = {
  AR,
  BO,
  BR,
  CL,
  CO,
  CU,
  DO,
  EC,
  SV,
  GT,
  GY,
  HT,
  HN,
  MX,
  NI,
  PA,
  PY,
  PR,
  PE,
  UY,
  VE,
};

type CountryFlagProps = ComponentProps<typeof AR> & {
  code: CountryCode;
};

export function CountryFlag({ code, ...props }: CountryFlagProps) {
  const Flag = FLAGS[code];

  return <Flag {...props} />;
}
