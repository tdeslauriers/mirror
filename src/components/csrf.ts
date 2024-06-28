import { useEffect, useState } from "react";

// sesson token will be pulled from cookie in routets. handler
const useCsrfToken = () => {
  const [csrf, setCsrf] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      if (!csrf || csrf.length === 0) {
        try {
          const response = await fetch("/api/csrf");
          if (response.ok) {
            const success = await response.json();
            setCsrf(success.csrf_token);
          } else {
            const fail = await response.json();
            // client side error handling
            console.error("Failed to fetch CSRF token: ", fail);
          }
        } catch (error) {
          // client side error handling
          console.error("Error fetching CSRF token: ", error);
        }
      }
    };
    fetchCsrfToken();
  }); // omitting empty dependency array so it only runs once when component mounts.

  return csrf;
};

export default useCsrfToken;
