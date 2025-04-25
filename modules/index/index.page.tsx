import { PageProps } from "fastro/core/server/types.ts";
import { Header } from "@app/components/header.tsx";
import { Footer } from "@app/components/footer.tsx";
import { GithubIcon } from "@app/components/icons/github.tsx";
import { GoogleIcon } from "@app/components/icons/google.tsx";
import { WhatsAppIcon } from "@app/components/icons/whatsapp.tsx";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { RibbonIcon } from "@app/components/icons/ribbon.tsx";

export default function Index({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    // youtube: string;
    // start: string;
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
        <RibbonIcon />
      </a>

      {/* Hexagonal Grid Background - Applied to entire page */}
      <div className="fixed inset-0 z-0 opacity-20">
        <HexaIcon />
      </div>

      {/* Content Container - All content will be above the background */}
      <div className="flex flex-col min-h-screen relative z-10">
        <Header />

        {/* Main Content Section */}
        <section className="flex-grow flex items-center justify-center">
          <div className="px-4 mx-auto max-w-5xl text-center">
            <h1 className="mb-4 mx-auto max-w-3xl text-4xl font-extrabold tracking-tight leading-none text-white dark:text-white glow-purple">
              {data.title}
            </h1>
            <p className="mb-8 mx-auto max-w-3xl text-lg font-normal text-white lg:text-xl dark:text-gray-100">
              {data.description}
            </p>

            {/* Login Buttons Container */}
            <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
              {/* GitHub Login Button (Default) */}
              <a
                href="/auth/github/signin"
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
    </main>
  );
}
