// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function About() {
  const cookieStore = await cookies();
  const hasIdentity = cookieStore.has("identity");
  return (
    <>
      <main className={`main ${hasIdentity ? "main-drawer" : null}`}>
        <div>
          <h1>
            About the{" "}
            <span className={`highlight`}>
              <strong>deslauriers.world</strong>
            </span>{" "}
            site:
          </h1>

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
                <br />
                <br />
                Finally, this site represents a body of work, serving as
                validation of{" "}
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
          </div>
        </div>

        {/* <hr className={`content-divider`} /> */}

        <div className={`content`}>
          <h1>The Current Tech Stack:</h1>
          <h2>Front End:</h2>
          <h3>
            <span className="highlight">User Interface/Experience (UI/UX)</span>
          </h3>
          <ul>
            <li>
              <strong>Service Name:</strong>{" "}
              <Link
                className={`locallink`}
                href="https://github.com/tdeslauriers/mirror"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mirror
              </Link>{" "}
              &mdash; a reference to Galadriel's mirror in J.R.R. Tolkien&apos;s{" "}
              <span style={{ fontStyle: "italic" }}>The Lord of the Rings</span>
              , which shows each person who views it something different.
            </li>
            <li>
              <strong>Description: </strong> Mirror is a{" "}
              <span className={`highlight`}>NextJS</span> application written in{" "}
              <span className={`highlight`}>TypeScript</span> using Next's App
              Router pattern.
            </li>
          </ul>
          <h2>Service Layer:</h2>
          <p>
            The over-arching theme in these serivces is to use as few third
            party libraries as possible. I spent the first half of my career
            using <span className="highlight">Java</span> frameworks like{" "}
            <span className="highlight">Spring Boot</span> and{" "}
            <span className="highlight">Micronaut</span>, which are very
            powerful and do a lot of things for you out of the box. My goal for
            this iteration of my services is to learn to do what those
            frameworks do for you, such as web calls and retries, persistance
            repositories, authentication, encryption, etc. To this end, I have
            written a stripped down version of a web framework called{" "}
            <Link
              className="locallink"
              href="https://github.com/tdeslauriers/carapace"
              target="_blannk"
              rel="noopener noreferrer"
            >
              carapace
            </Link>{" "}
            (because 'exoskeleton' was taken) to provide reusable components,
            functions, and models for my services below. Also in{" "}
            <Link
              className="locallink"
              href="https://github.com/tdeslauriers/carapace"
              target="_blannk"
              rel="noopener noreferrer"
            >
              carapace
            </Link>{" "}
            , I am slwoly building up CLI code/tools to perform tedious support
            and DevOps activities like cert rotation.
          </p>
          <h3>
            <span className="highlight">Service-to-Service Authentication</span>
          </h3>
          <ul>
            <li>
              <strong>Service Name:</strong>{" "}
              <Link
                className={`locallink`}
                href="https://github.com/tdeslauriers/ran"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ran
              </Link>{" "}
              &mdash; Rán (燃) is the name of one of two twin dragons in{" "}
              <span style={{ fontStyle: "italic" }}>
                Avatar: The Last Airbender
              </span>
              . Ran (燃) means "burn" or "ignite" in Mandarin, and since all
              services need to get service credentials before taking any other
              action, the ignite side of the dragon pair seemed appropriate.
            </li>
            <li>
              <strong>Description: </strong> Ran is an application written in{" "}
              <span className={`highlight`}>Go</span>, utilizing my{" "}
              <Link
                className="locallink"
                href="https://github.com/tdeslauriers/carapace"
                target="_blannk"
                rel="noopener noreferrer"
              >
                carapace
              </Link>{" "}
              project for core microservice functionality. It provides
              service-to-service (s2s) authentication and authorization to the
              rest of the services in the cluster. It mints s2s JWT tokens and
              it is the source of for JWT scopes simply because the table
              existed in this service first.
            </li>
          </ul>
          <h3>
            <span className={`highlight`}>Identity</span>
          </h3>
          <ul>
            <li>
              <strong>Service Name:</strong>{" "}
              <Link
                className={`locallink`}
                href="https://github.com/tdeslauriers/shaw"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shaw
              </Link>
              &mdash; Shaw, or more correctly: shāo (燒), means "burn" or
              "blaze" in Mandarin, and is the second of two twin dragons in{" "}
              <span style={{ fontStyle: "italic" }}>
                Avatar: The Last Airbender
              </span>
              .
            </li>
            <li>
              <strong>Description: </strong> Shaw is an application written in{" "}
              <span className={`highlight`}>Go</span>, utilizing my{" "}
              <Link
                className="locallink"
                href="https://github.com/tdeslauriers/carapace"
                target="_blannk"
                rel="noopener noreferrer"
              >
                carapace
              </Link>{" "}
              project for core microservice functionality. It is the service
              counterpart to{" "}
              <Link
                className={`locallink`}
                href="https://github.com/tdeslauriers/ran"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ran
              </Link>
              , providing user authentication and authorization. It mints user
              JWT tokens and it is the source of truth for user identity, though
              it does not contain all of a user&apos;s profile information.
            </li>
          </ul>

          <h3>
            <span className={`highlight`}>Gateway</span>
          </h3>
          <ul>
            <li>
              <strong>Service Name:</strong>{" "}
              <Link
                className={`locallink`}
                href="https://github.com/tdeslauriers/erebor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Erebor
              </Link>{" "}
              &mdash; Erebor is the actual name of the Lonely Mountain from
              J.R.R. Tolkien&apos;s{" "}
              <span style={{ fontStyle: "italic" }}>The Hobbit</span>. It is
              where Smaug is sitting on his mound of treasure, i.e., this
              gateway will give access to the site's restricted content. Also,
              in the story, Erebor had a Great Main Gate so I thought it fit.
            </li>
            <li>
              <strong>Description: </strong> Erebor is an application written in{" "}
              <span className={`highlight`}>Go</span>, utilizing my{" "}
              <Link
                className="locallink"
                href="https://github.com/tdeslauriers/carapace"
                target="_blannk"
                rel="noopener noreferrer"
              >
                carapace
              </Link>{" "}
              project for core microservice functionality. It provides the main
              entry point to family website&apos;s backend functionality and
              restricted content. It is more than a reverse proxy, however, it
              manages user sessions, Oauth2 exchange flow, and JWT tokens. Also,
              it collates composite data from multiple services. It can be be
              thought of as the site&apos;s primary service, or hub, with the
              other support services coming off of it like spokes.
            </li>
          </ul>
          <h2>Peristance Layer:</h2>

          <p>
            All of the service layer applications persist data to{" "}
            <span className="highlight">MariaDB</span> databases behind the
            scenes.
          </p>
          <h2>Infrastructure:</h2>

          <p>
            All of the service applications run in{" "}
            <span className="highlight">Docker</span> containers, hosted in a{" "}
            <span className="highlight">Kubernetes (k8s)</span> cluster running
            on various old, busted computers at my house.
          </p>
        </div>
      </main>
    </>
  );
}
