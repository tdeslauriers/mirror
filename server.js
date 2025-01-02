const { createServer: createHttpsServer } = require("https");
const { createServer: createHttpServer } = require("http");
const { parse } = require("url");
const next = require("next");

// determine if we are in development mode -> needed for nextjs dev env functionality
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// validate that cert env vars are set
if (!process.env.MIRROR_SERVER_CERT) {
  throw new Error("MIRROR_SERVER_CERT not set.");
}

if (!process.env.MIRROR_SERVER_KEY) {
  throw new Error("MIRROR_SERVER_KEY not set.");
}

// certs
const httpsOptions = {
  key: process.env.MIRROR_SERVER_KEY,
  cert: process.env.MIRROR_SERVER_CERT,
};

// ports
const httpsPort = 3443;
const httpPort = 3000;

app.prepare().then(() => {
  console.log("App is prepared");
  // HTTP server --> redirect all traffic to HTTPS
  createHttpServer((req, res) => {
    const host = req.headers.host || "";

    res.writeHead(301, { Location: `https://${host}${req.url}` });
    res.end();
  }).listen(httpPort, () => {
    console.log(
      `HTTP server running on port ${httpPort}, redirecting to HTTPS`
    );
  });

  // HTTPS server
  createHttpsServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  }).listen(httpsPort, (err) => {
    if (err) throw err;
    console.log(
      `> Ready on https://deslauriers.world:${httpsPort} (${
        dev ? "Development" : "Production"
      })`
    );
  });
});
