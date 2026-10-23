'use client';

import { Children, useSyncExternalStore, type ReactNode } from 'react';

type QuotePickerProps = {
  className?: string;
  children: ReactNode;
};

let pick: number | null = null;

function subscribe() {
  return () => {};
}

// One pick per page load, made in the browser so the pages themselves stay static.
function getPick() {
  pick ??= Math.random();

  return pick;
}

function getServerPick() {
  return null;
}

export function QuotePicker({ className, children }: QuotePickerProps) {
  const quotes = Children.toArray(children);
  const value = useSyncExternalStore<number | null>(subscribe, getPick, getServerPick);

  // The static HTML carries an empty placeholder until the browser picks a quote.
  if (value === null) {
    return <figure className={className} aria-hidden="true" />;
  }

  return quotes[Math.floor(value * quotes.length)];
}
