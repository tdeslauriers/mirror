import { ReactNode } from "react";
import style from "./modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null; // Prevent rendering if modal is closed

  return (
    <div
      className={style.overlay}
      onClick={onClose} // Close when clicking outside
    >
      <div className={style.content} onClick={(e) => e.stopPropagation()}>
        
          <button className={style.close} onClick={onClose}>
            ✕
          </button>
        
        {children}
      </div>
    </div>
  );
}
