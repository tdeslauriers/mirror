"use client";

import { useState } from "react";

export default function ClipboardButton({
  text,
  label,
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert(`Failed to copy to clipboard.`);
    }
  };

  return (
    <>
      <button
        className="clipboard-button"
        style={{ width: "auto" }}
        type="button"
        onClick={handleCopy}
        title="Copy to clipboard"
        disabled={!text || text.length < 1 || copied}
      >
        {copied ? `Copied link!` : `Share ${label ? label : "link"}`}
      </button>
    </>
  );
}
