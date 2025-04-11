import { PageProps } from "fastro/core/server/types.ts";
import { Header } from "@app/components/header.tsx";
import { Footer } from "@app/components/footer.tsx";

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
    <main class={`h-full flex flex-col justify-center`}>
      <Header />
      <section class="bg-gray-950">
        <div class="px-4 mx-auto max-w-8xl text-center">
          <h1 class="mb-4 mx-auto max-w-3xl text-4xl font-extrabold tracking-tight leading-none text-gray-100 md:text-5xl lg:text-6xl dark:text-white">
            {data.title}
          </h1>
          <p class="mb-8 mx-auto max-w-3xl text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
            {data.description}
          </p>
          <div class="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href={data.start}
              class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
            >
              Get started
              <svg
                class="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                >
                </path>
              </svg>
            </a>
            <div class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-100 rounded-lg border border-gray-300 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
              deno run -A -r https://fastro.deno.dev
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
