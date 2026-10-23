import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { DEFAULT_LOCALE, isSupportedLocale, negotiateLocale } from '~/lib/i18n/locale';

const LOCALE_SHAPED = /^[a-z]{2}(-[a-z]{2})?$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const segment = pathname.split('/')[1];
  const url = request.nextUrl.clone();

  if (isSupportedLocale(segment)) {
    return NextResponse.next();
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
