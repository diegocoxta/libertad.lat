import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
};

// Follows the browser's color scheme and sets data-theme on <html> before the first paint.
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider enableSystem enableColorScheme disableTransitionOnChange defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}
