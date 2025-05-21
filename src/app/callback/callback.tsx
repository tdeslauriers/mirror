"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { State } from "../api";
import Loading from "@/components/loading";
import ErrorLoadPage from "@/components/errors/error-load-page";

export default function Callback() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [callbackSucceeded, setCallbackSucceeded] = useState<boolean>(false);

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

  // useRef to ensure idempotence (runs only once)
  const hasCalledCallback = useRef(false);

  useEffect(() => {
    const fetchCallback = async () => {
      // prevent multiple invocations of the callback
      if (hasCalledCallback.current) {
        return;
      }
      hasCalledCallback.current = true;

      try {
        const response = await fetch(callback, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // no need to turn off loading because will navigate away
          setCallbackSucceeded(true);
        } else {
          const fail = await response.json().catch(() => null);
          console.error("call to redirect/callback failed", fail);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("failed to call oauth 2 redirect/callback", error);
        setIsLoading(false);
      }
    };

    fetchCallback();
  }, []);

  useEffect(() => {
    if (!callbackSucceeded) {
      return;
    }

    try {
      if (state && state.length >= 36 && state.length <= 256) {
        const oauthState: State = JSON.parse(atob(state));
        if (
          oauthState.nav_endpoint &&
          oauthState.nav_endpoint.length > 0 &&
          oauthState.nav_endpoint.length <= 256
        ) {
          window.location.href = oauthState.nav_endpoint;
          return;
        }
      }
    } catch (error) {
      console.log("failed to parse state", error);
    }

    // fallback to home page if state/nav is not valid
    window.location.href = "/";
  }, [callbackSucceeded]);

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && !callbackSucceeded && (
        <ErrorLoadPage errMsg={"Login failed."} redirectUrl={"/login"} />
      )}
    </>
  );
}
