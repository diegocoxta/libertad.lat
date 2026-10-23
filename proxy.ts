import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { parseCountrySlug } from '~/lib/countries';
import { DEFAULT_LOCALE, isSupportedLocale, negotiateLocale } from '~/lib/i18n/locale';

const LOCALE_SHAPED = /^[a-z]{2}(-[a-z]{2})?$/i;

function isPage(slug: string): boolean {
  return slug === '2026' || parseCountrySlug(slug) !== null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const [, segment, ...path] = pathname.split('/');
  const url = request.nextUrl.clone();

  if (isSupportedLocale(segment)) {
    const parts = path.filter(Boolean);

    if (parts.length === 0 || (parts.length === 1 && isPage(parts[0]))) {
      return NextResponse.next();
    }

    // Wrong letter case is the same page under another address.
    if (parts.length === 1 && isPage(parts[0].toLowerCase())) {
      url.pathname = `/${segment}/${parts[0].toLowerCase()}`;

      return NextResponse.redirect(url, 308);
    }

    // A page that fails after it started streaming cannot change its status anymore, so an unknown
    // address is sent to a path no route matches (three segments), which answers 404 with
    // app/global-not-found.tsx.
    url.pathname = '/not-found/404/404';

    return NextResponse.rewrite(url);
  }

  if (LOCALE_SHAPED.test(segment)) {
    url.pathname = `/${DEFAULT_LOCALE}${pathname.slice(segment.length + 1)}`;

    return NextResponse.redirect(url);
  }

  const locale = negotiateLocale(request.headers.get('accept-language'));

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)'],
};
