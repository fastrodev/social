import { LayoutProps } from "fastro/core/server/types.ts";

export function indexLayout(
  { data, children }: LayoutProps<
    { title: string; description: string; image: string }
  >,
) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{data.title + " | Fastro Social"}</title>
        <meta name="description" content={data.description} />
        <meta property="og:image" content={data.image} />
        <link href="styles.css" rel="stylesheet" />
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
      </head>
      <body
        id="root"
        class={`h-screen bg-gray-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
