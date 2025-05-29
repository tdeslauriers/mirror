import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    strong: ({ children }) => <span className="highlight">{children}</span>,
    a: ({ href, children, ...props }) => {
      // check for href
      if (!href) return <a {...props}>{children}</a>;
      return (
        <>
          {href.startsWith("/") ? (
            <Link className="locallink" href={href}>
              {children}
            </Link>
          ) : (
            <Link
              className="locallink"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </Link>
          )}
        </>
      );
    },

    ...components,
  };
}
