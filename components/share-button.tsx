'use client';

import { useRef } from 'react';

import styles from './share-button.module.css';

type ShareButtonProps = {
  label: string;
  text: string;
  pagePath: string;
  imagePath: string;
  fileName: string;
};

export function ShareButton({ label, text, pagePath, imagePath, fileName }: ShareButtonProps) {
  const imageRef = useRef<Promise<File | null> | null>(null);

  // Loads the image as soon as the visitor shows intent, so the share sheet opens right after the click.
  function prepare() {
    imageRef.current ??= fetch(imagePath)
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => (blob ? new File([blob], fileName, { type: 'image/png' }) : null))
      .catch(() => null);

    return imageRef.current;
  }

  function download() {
    const link = document.createElement('a');

    link.href = imagePath;
    link.download = fileName;
    link.click();
  }

  async function share() {
    const file = await prepare();

    if (!file || !navigator.canShare?.({ files: [file] })) {
      download();

      return;
    }

    try {
      await navigator.share({ files: [file], text: `${text}\n${new URL(pagePath, window.location.origin).href}` });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        download();
      }
    }
  }

  return (
    <button type="button" className={styles.button} onClick={share} onPointerEnter={prepare} onFocus={prepare}>
      {label}
    </button>
  );
}
