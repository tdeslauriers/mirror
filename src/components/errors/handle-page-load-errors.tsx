import ErrorLoadPage from "@/components/errors/error-load-page";

// handleGetDataErrors handles the errors returned from getting resources from the gateway and building
// the error messages to be displayed on the error page.
export default function handlePageLoadFailure(
  errorCode?: number,
  errorMessage?: string,
  redirectUrl?: string
) {
  switch (errorCode) {
    case 400:
      return (
        <ErrorLoadPage
          errBanner="400 | Woah, you really messed up..."
          errMsg={
            errorMessage
              ? errorMessage
              : "Your request was bad and you should feel bad."
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 401:
      return (
        <ErrorLoadPage
          errBanner="401 | That's a no from me dawg..."
          errMsg={errorMessage ? errorMessage : "No ticket."}
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 403:
      return (
        <ErrorLoadPage
          errBanner="403 | You shall not pass!"
          errMsg={
            errorMessage
              ? errorMessage
              : "I am a servant of the Secret Fire, wielder of the flame of Anor. You cannot pass. The dark fire will not avail you, flame of Udun. Go back to the Shadow! You cannot pass."
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 404:
      return (
        <ErrorLoadPage
          errBanner="404 | You're off the map..."
          errMsg={errorMessage ? errorMessage : "Here there be monsters."}
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 405:
      return (
        <ErrorLoadPage
          errBanner="405 | You cant even do that..."
          errMsg={
            errorMessage
              ? errorMessage
              : "It's not what you asked, but how you asked it."
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 410:
      return (
        <ErrorLoadPage
          errBanner="410 | Gone, but not forgotten..."
          errMsg={
            errorMessage
              ? errorMessage
              : "You missed your chance, it's gone now."
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 422:
      return (
        <ErrorLoadPage
          errBanner="422 | Wait, what?"
          errMsg={
            errorMessage ? errorMessage : "What was that even supposed to mean?"
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    case 503:
      return (
        <ErrorLoadPage
          errBanner="503 | Sorry, we're closed..."
          errMsg={errorMessage ? errorMessage : "Stuff is down, it's a mess."}
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
    default:
      return (
        <ErrorLoadPage
          errBanner="Well, that didn't work..."
          errMsg={
            errorMessage ? errorMessage : "Something has gone terribly wrong."
          }
          redirectUrl={redirectUrl ? redirectUrl : ""}
        />
      );
  }
}
