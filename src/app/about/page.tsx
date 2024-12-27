process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function About() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div>
          <h2>
            About the{" "}
            <span className={`highlight`}>
              <strong>deslauriers.world</strong>
            </span>{" "}
            site:
          </h2>

          <div className={`center`}>
            <div className={`content`}>
              <p>
                I wanted a place to host pictures of/for my family and friends
                since I don&apos;t post photos of us on social media generally.
                Over the years, the site has become my Frankenstein&apos;s
                monster or as a friend said,{" "}
                <span style={{ fontStyle: "italic" }}>
                  &quot;the most over-engineered image-server of all time.&quot;
                </span>
                <br />
                <br />
                When I want to learn about coding languages, frameworks,
                design-patterns, etc., I will read and/or take a course, and
                then get practical experience by designing new features or
                rebuilding a component herein. The site began as an{" "}
                <span className={`highlight`}>
                  <strong>AngularJS</strong>
                </span>{" "}
                learning project, was rebuilt as a{" "}
                <span className={`highlight`}>
                  <strong>Spring Boot</strong>
                </span>{" "}
                monolith, rebuilt again as a{" "}
                <span className={`highlight`}>
                  <strong>Spring Cloud</strong>
                </span>{" "}
                microservice cluster, and again to a{" "}
                <span className={`highlight`}>
                  <strong>Micronaut</strong>
                </span>{" "}
                cluster with a{" "}
                <span className={`highlight`}>
                  <strong>ReactJS</strong>{" "}
                </span>
                frontend, and now is a{" "}
                <span className={`highlight`}>
                  <strong>NextJS</strong>
                </span>{" "}
                site supported by{" "}
                <span className={`highlight`}>
                  <strong>Go</strong>
                </span>{" "}
                micro-services in{" "}
                <span className={`highlight`}>
                  <strong>Kubernetes.</strong>
                </span>
              </p>
            </div>
          </div>
          <p>
            Finally, this site represents a body of work, serving as validation
            of{" "}
            <Link
              className={`locallink`}
              href="https://www.linkedin.com/in/tomdeslauriers/"
              target="_blank"
              rel="noopener noreferrer"
            >
              my resume
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}
