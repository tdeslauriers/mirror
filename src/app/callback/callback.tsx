"use client";
import Link from "next/link";
import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AuthError from "@/components/error-Authentication";

type Err = { [key: string]: string[] };

export default function Callback() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [callbackSucceeded, setCallbackSucceeded] = useState<boolean>(false);

  const router = useRouter();

  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");
  const responseType = searchParams.get("response_type");
  const authCode = searchParams.get("auth_code");
  const state = searchParams.get("state");
  const nonce = searchParams.get("nonce");
  const redirect_url = searchParams.get("redirect_url");

  // build callback url path
  const callback = `/api/token/callback?client_id=${clientId}&response_type=${responseType}&auth_code=${authCode}&state=${state}&nonce=${nonce}&redirect_url=${encodeURIComponent(
    redirect_url ?? ""
  )}`;

  useEffect(() => {
    const fetchCallback = async () => {
      try {
        const response = await fetch(callback, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setIsLoading(false);
          setCallbackSucceeded(true);
        } else {
          const fail = await response.json();
          console.log("failed to call oauth 2 redirect", fail);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchCallback();
  }, []);
  if (callbackSucceeded) {
    router.push("/");
  }

  return (
    <>
      <div className={styles.header}>
        {isLoading && <h1>Placeholder for Loading...</h1>}
        {!isLoading && !callbackSucceeded && <AuthError />}
      </div>
    </>
  );
}
