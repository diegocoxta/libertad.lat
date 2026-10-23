'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import styles from './modal.module.css';

type ModalProps = {
  label: string;
  closeLabel: string;
  children: ReactNode;
};

export function Modal({ label, closeLabel, children }: ModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      className={styles.modal}
      onClose={() => router.back()}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.close();
        }
      }}
    >
      <button type="button" aria-label={closeLabel} className={styles.close} onClick={() => dialogRef.current?.close()}>
        ×
      </button>

      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
