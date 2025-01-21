import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./styles/globals.css";
import "./styles/page.css";
import "./styles/form.css";
import "./styles/table.css";

import MainHeader from "@/components/nav/nav-main-header";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "des Lauriers World",
  description: "Our family website, including gallery and other projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity")
    ? cookieStore.get("identity")
    : null;

  return (
    <html lang="en">
      <body className={inter.className}>
        <MainHeader />
        {children}
        <footer>
          <div style={{ fontStyle: "italic" }}>
            Designed, deployed, and administered by{" "}
            <span className={"highlight"}>Tom des Lauriers</span>.
          </div>
        </footer>
      </body>
    </html>
  );
}
