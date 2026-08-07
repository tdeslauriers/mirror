"use client";

import { ReactNode, useEffect, useRef } from "react";
import style from "./modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** extra class on the <dialog> — for variants like the mobile drawer */
  className?: string;
  /** id of the heading inside children */
  labelledBy?: string;
  label?: string;
  showClose?: boolean;
  closeOnBackdrop?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
  labelledBy,
  label,
  showClose = true,
  closeOnBackdrop = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (isOpen && !element.open) element.showModal();
    if (!isOpen && element.open) element.close();
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      className={`${style.dialog} ${className ?? ""}`}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={style.content}>
        {showClose && (
          <button
            type="button"
            className={style.close}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </dialog>
  );
}
