import { PageProps } from "fastro/core/server/types.ts";
import { Footer } from "../../components/Footer.tsx";
import { GithubIcon } from "@app/components/icons/github.tsx";
import { GoogleIcon } from "@app/components/icons/google.tsx";
import { WhatsAppIcon } from "@app/components/icons/whatsapp.tsx";
import { HexaIcon } from "@app/components/icons/hexa.tsx";
import { RibbonIcon } from "@app/components/icons/ribbon.tsx";
import { useEffect, useState } from "preact/hooks";
import Header from "@app/components/Header.tsx";

export default function Signin({ data }: PageProps<
  {
    user: string;
    title: string;
    description: string;
    github_auth: string;
  }
>) {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  console.log("Rendering Index with data:", data);

  useEffect(() => {
    const checkHealth = async () => {
      const maxRetries = 5;
      const retryDelay = 2000;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(
            "https://web.fastro.dev/api/healthcheck",
          );
          console.log(`Health check attempt ${attempt + 1}:`, response);

          if (response.ok) {
            setIsHealthy(true);
            setIsChecking(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } catch (error) {
          console.error(`Health check attempt ${attempt + 1} failed:`, error);
          if (attempt === maxRetries - 1) {
            setIsChecking(false);
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
      setIsChecking(false);
    };

    checkHealth();
  }, []);

  const buttonText = isChecking
    ? <span className="animate-ellipsis">Checking Service</span>
    : (isHealthy ? "Sign in with GitHub" : "Service Unavailable");

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
              {/* GitHub Login Button */}
              <a
                href={isHealthy
                  ? (data.github_auth || "/auth/github/signin")
                  : "#"}
                className={`inline-flex items-center justify-center px-5 py-4 text-base font-medium text-white ${
                  isChecking
                    ? "bg-purple-500 cursor-wait"
                    : isHealthy
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-600 cursor-not-allowed"
                } rounded-lg focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-lg border-2 border-purple-400`}
              >
                <GithubIcon />
                <span className="ml-2 text-lg">
                  {buttonText}
                </span>
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
