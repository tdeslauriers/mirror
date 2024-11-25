"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { pageError } from ".";
import { State } from "../api";

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
          throw new Error(pageError);
        }
      } catch (error) {
        console.log(error);
        throw new Error(pageError);
      }
    };

    fetchCallback();
  });

  if (callbackSucceeded) {
    if (state && state.length >= 36 && state.length <= 256) {
      const oauthState: State = JSON.parse(atob(state));
      if (
        oauthState.nav_endpoint &&
        oauthState.nav_endpoint.length > 0 &&
        oauthState.nav_endpoint.length <= 256
      ) {
        window.location.href = oauthState.nav_endpoint;
      }
    } else {
      window.location.href = "/";
    }
  }

  return (
    <>
      <div className={`center`}>
        {isLoading && <h1>Placeholder for Loading...</h1>}
      </div>
    </>
  );
}
