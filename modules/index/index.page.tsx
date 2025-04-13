import { PageProps } from "fastro/core/server/types.ts";
import { Header } from "@app/components/header.tsx";
import { Footer } from "@app/components/footer.tsx";
import { GithubIcon } from "@app/components/icon/github.tsx";
import { GoogleIcon } from "@app/components/icon/google.tsx";
import { WhatsAppIcon } from "@app/components/icon/whatsapp.tsx";
import { HexaIcon } from "@app/components/icon/hexa.tsx";

export default function Index({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    youtube: string;
    start: string;
  }
>) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      {/* GitHub Ribbon - Top Right Corner */}
      <a
        href="https://github.com/fastrodev/social"
        className="github-corner z-50"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 250 250"
          style={{
            fill: "#a855f7",
            color: "#111827",
            position: "absolute",
            top: 0,
            border: 0,
            right: 0,
          }}
          aria-hidden="true"
        >
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path
            d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
            fill="currentColor"
            style={{ transformOrigin: "130px 106px" }}
            className="octo-arm"
          >
          </path>
          <path
            d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
            fill="currentColor"
            className="octo-body"
          >
          </path>
        </svg>
      </a>

      {/* Hexagonal Grid Background - Applied to entire page */}
      <div className="fixed inset-0 z-0 opacity-20">
        <HexaIcon />
      </div>

      {/* Content Container - All content will be above the background */}
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />

        <section className="flex-grow flex items-center justify-center">
          <div className="px-4 mx-auto max-w-8xl text-center">
            <h1 className="mb-4 mx-auto max-w-3xl text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl dark:text-white glow-purple">
              {data.title}
            </h1>
            <p className="mb-8 mx-auto max-w-3xl text-lg font-normal text-white lg:text-xl dark:text-gray-100">
              {data.description}
            </p>

            {/* Login Buttons Container */}
            <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
              {/* GitHub Login Button (Default) */}
              <a
                href="/auth/github"
                className="inline-flex items-center justify-center px-5 py-4 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-lg border-2 border-purple-400"
              >
                <GithubIcon />
                <span className="ml-2 text-lg">Sign in with GitHub</span>
              </a>

              <div className="flex items-center my-2">
                <hr className="flex-grow border-gray-600" />
                <span className="px-3 text-sm text-gray-400">
                  Coming soon
                </span>
                <hr className="flex-grow border-gray-600" />
              </div>

              {/* Other Login Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Login Button (Disabled) */}
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-400 bg-gray-800 rounded-lg cursor-not-allowed opacity-60 shadow-lg"
                >
                  <GoogleIcon />
                  <span className="ml-2">Google</span>
                </button>

                {/* WhatsApp Login Button (Disabled) */}
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-400 bg-gray-800 rounded-lg cursor-not-allowed opacity-60 shadow-lg"
                >
                  <WhatsAppIcon />
                  <span className="ml-2">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Add the CSS for the glowing effect and GitHub corner animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .glow-purple {
            color: white;
            text-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #7e22ce;
          }

          .github-corner:hover .octo-arm {
            animation: octocat-wave 560ms ease-in-out;
          }

          @keyframes octocat-wave {
            0%, 100% { transform: rotate(0); }
            20%, 60% { transform: rotate(-25deg); }
            40%, 80% { transform: rotate(10deg); }
          }

          @media (max-width: 500px) {
            .github-corner:hover .octo-arm {
              animation: none;
            }
            .github-corner .octo-arm {
              animation: octocat-wave 560ms ease-in-out;
            }
          }
          `,
        }}
      />
    </main>
  );
}
