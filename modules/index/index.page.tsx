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
      <section class="bg-gray-950 relative">
        {/* Grid Background */}
        <div class="absolute inset-0 z-0 opacity-10">
          <div class="h-full w-full bg-[linear-gradient(#333_1px,transparent_1px),linear-gradient(to_right,#333_1px,transparent_1px)] bg-[size:40px_40px]">
          </div>
        </div>

        <div class="px-4 mx-auto max-w-8xl text-center relative z-10">
          <h1 class="mb-4 mx-auto max-w-3xl text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl dark:text-white glow-purple">
            {data.title}
          </h1>
          <p class="mb-8 mx-auto max-w-3xl text-lg font-normal text-white lg:text-xl dark:text-gray-100 glow-purple-subtle">
            {data.description}
          </p>
        </div>
      </section>
      <Footer />

      {/* Add the CSS for the glowing effect */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .glow-purple {
            color: white;
            text-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 30px #7e22ce;
          }
          .glow-purple-subtle {
            color: white;
            text-shadow: 0 0 5px #a78bfa, 0 0 10px #8b5cf6, 0 0 15px #6d28d9;
          }
        `,
        }}
      />
    </main>
  );
}
