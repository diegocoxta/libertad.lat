import type { CountryCode } from "~/lib/countries";
import type { CountryContentType } from "~/lib/country-content";

import arContent from "./ar";
import boContent from "./bo";
import brContent from "./br";
import clContent from "./cl";
import coContent from "./co";
import cuContent from "./cu";
import doContent from "./do";
import ecContent from "./ec";
import gtContent from "./gt";
import gyContent from "./gy";
import hnContent from "./hn";
import htContent from "./ht";
import mxContent from "./mx";
import niContent from "./ni";
import paContent from "./pa";
import peContent from "./pe";
import prContent from "./pr";
import pyContent from "./py";
import svContent from "./sv";
import uyContent from "./uy";
import veContent from "./ve";

export const COUNTRY_CONTENT: Partial<Record<CountryCode, CountryContentType>> = {
  AR: arContent,
  BO: boContent,
  BR: brContent,
  CL: clContent,
  CO: coContent,
  CU: cuContent,
  DO: doContent,
  EC: ecContent,
  GT: gtContent,
  GY: gyContent,
  HN: hnContent,
  HT: htContent,
  MX: mxContent,
  NI: niContent,
  PA: paContent,
  PE: peContent,
  PR: prContent,
  PY: pyContent,
  SV: svContent,
  UY: uyContent,
  VE: veContent,
};
