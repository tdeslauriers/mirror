import GetCsrf from "@/components/csrf-token";
import AllowanceForm from "@/components/forms/allowance-form";
import Loading from "@/components/loading";
import Link from "next/link";
import { Suspense } from "react";
import { handleAllowanceEdit } from "./actions";
import {checkForIdentityCookie, UiCookies } from "@/components/checkCookies";
import callGatewayData from "@/components/call-gateway-data";
import { Allowance } from "@/components/forms";

export const metadata = {
  robots: "noindex, nofollow",
};

const pageError = "Failed to load allowance record page: ";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // get slug param from url
  const slug = (await params).slug;

  // quick for redirect if auth'd cookies not present
  const cookies: UiCookies = await checkForIdentityCookie(
    `/allowances/${slug}`
  );

  // get csrf token from gateway for allowance form updates
  const csrf = await GetCsrf(
    cookies.session?.value ? cookies.session.value : ""
  );

  if (!csrf) {
    console.log(
      pageError + "CSRF token could not be retrieved for scope form."
    );
    throw new Error(
      pageError + "CSRF token could not be retrieved for scope form."
    );
  }

  // get allowance account data from gateway
  const allowance: Allowance = await callGatewayData(
    `/allowances/${slug}`,
    cookies.session?.value
  );

  return (
    <>
      <main className="main main-drawer">
        <div className="center"></div>
        <div className="page-title">
          <div
            className="actions"
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            <h1>
              Allowance Account:{" "}
              <span className="highlight">{allowance?.username}</span>
            </h1>
            <Link href={`/allowances`}>
              <button>Allowances Table</button>
            </Link>
          </div>
        </div>
        <hr className="page-title" />
        {allowance && allowance.created_at && (
          <div className="banner">
            Allowance account created{" "}
            {new Date(allowance.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        )}
        <div className="card-title">
          <h2>
            Uuid:{" "}
            {allowance && allowance.id && (
              <span className="highlight">{allowance.id}</span>
            )}
          </h2>
          <h2>
            Slug:{" "}
            {allowance && allowance.id && (
              <span className="highlight">{allowance.slug}</span>
            )}
          </h2>
        </div>

        <Suspense fallback={<Loading />}>
          <div className="card">
            <AllowanceForm
              csrf={csrf}
              slug={slug}
              allowance={allowance}
              allowanceFormUpdate={handleAllowanceEdit}
            />
          </div>
        </Suspense>
      </main>
    </>
  );
}
