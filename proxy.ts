import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { isSupportedLocale, negotiateLocale } from '~/lib/i18n/locale';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isSupportedLocale(pathname.split('/')[1])) {
    return NextResponse.next();
  }

  const locale = negotiateLocale(request.headers.get('accept-language'));
  const url = request.nextUrl.clone();

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)'],
};
