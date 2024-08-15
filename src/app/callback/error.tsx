"use client";

import Link from "next/link";
import styles from "./page.module.css";
import AuthError from "@/components/error-Authentication";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <AuthError  />
    </>
  );
}
