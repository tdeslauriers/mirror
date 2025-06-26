import { NextRequest, NextResponse } from "next/server";

// created to bypass dev cors issues: http client -> https minio server
// not needed in production
export async function PUT(req: NextRequest) {
  // check if env is not dev: if not, refuse request
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { message: "Proxy disabled in production" },
      { status: 404 }
    );
  } else {
    // in dev, allow request to proceed
    console.log("Dev environment: allowing PUT request to minio via proxy");

    // get url from request
    const url = req.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { message: "Missing URL parameter" },
        { status: 400 }
      );
    }

    const contentType =
      req.headers.get("Content-Type") ?? "application/octet-stream";
    const body = await req.arrayBuffer();

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
    });

    return NextResponse.json({ status: res.status });
  }
}
