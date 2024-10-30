import { OauthExchange } from "./../app/api/";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Err = { [key: string]: string[] };

const useOuathExchange = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [oauthExchange, setOauthExchange] = useState<OauthExchange | null>(
    null
  );

  // next navigation
  const router = useRouter();
  const searchParams = useSearchParams();
  const path = usePathname();

  useEffect(() => {
    const fetchOauthExchange = async () => {
      try {
        const response = await fetch("/api/login/state", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          return response.json();
        } else {
          const error = await response.json();
          return Promise.reject(error);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    };

    const responseTypeParam = searchParams.get("response_type");
    const stateParam = searchParams.get("state");
    const nonceParam = searchParams.get("nonce");
    const clientIdParam = searchParams.get("client_id");
    const redirectUrlParam = searchParams.get("redirect_url");

    if (
      !responseTypeParam ||
      !stateParam ||
      !nonceParam ||
      !clientIdParam ||
      !redirectUrlParam
    ) {
      
      fetchOauthExchange()
        .then((exchange) => {
          if (
            exchange.response_type &&
            exchange.state &&
            exchange.nonce &&
            exchange.redirect_url &&
            exchange.client_id
          ) {
            const oauth: OauthExchange = {
              response_type: responseTypeParam,
              state: stateParam,
              nonce: nonceParam,
              client_id: clientIdParam,
              redirect_url: redirectUrlParam,
              created_at: null,
            };
            setOauthExchange(oauth);

            // update url with state and nonce
            router.replace(
              `${path}?client_id=${exchange.client_id}&response_type=${
                exchange.response_type
              }&state=${exchange.state}&nonce=${
                exchange.nonce
              }&redirect_url=${encodeURIComponent(exchange.redirect_url)}`
            );

            setIsLoading(false);
          }
        })
        .catch((error) => {
          console.error("state-nonce api call failed: ", error);
        });
    } else {
      const oauth: OauthExchange = {
        response_type: responseTypeParam,
        state: stateParam,
        nonce: nonceParam,
        client_id: clientIdParam,
        redirect_url: redirectUrlParam,
        created_at: null,
      };
      setOauthExchange(oauth);
      setIsLoading(false);
    }
  }, [searchParams, router]);

  return { isLoading, oauthExchange };
};

export default useOuathExchange;
