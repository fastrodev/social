import { LayoutProps } from "fastro/mod.ts";

export default function layout(
  { data, children }: LayoutProps<
    {
      title: string;
      description: string;
      image: string;
      url: string;
      author: string;
      brand: string;
      publishDate?: string; // Add this new optional property
    }
  >,
) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>{data.title} | {data.brand}</title>

        {/* Primary Meta Tags */}
        <meta
          name="title"
          content={`${data.title} | ${data.brand}`}
        />
        <meta name="description" content={data.description} />
        <meta
          name="keywords"
          content="fastro, post, social media, content sharing"
        />

        {data.author && <meta name="author" content={data.author} />}
        {data.author && <meta property="og:type" content="profile" />}

        {/* Publication Date */}
        {data.publishDate && <meta name="date" content={data.publishDate} />}
        {data.publishDate && (
          <meta property="article:published_time" content={data.publishDate} />
        )}

        {/* Open Graph / Facebook */}
        <meta
          property="og:type"
          content={data.publishDate ? "article" : "website"}
        />
        <meta property="og:url" content={data.url} />
        <meta
          property="og:title"
          content={`${data.title} | ${data.brand}`}
        />
        <meta property="og:description" content={data.description} />
        <meta property="og:image" content={data.image} />
        <meta property="og:site_name" content={data.brand} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={data.url} />
        <meta
          property="twitter:title"
          content={`${data.title} | ${data.brand}`}
        />
        <meta property="twitter:description" content={data.description} />
        <meta property="twitter:image" content={data.image} />

        {/* PWA Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#000000" />

        {/* Links */}
        <link href="/styles.css" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="canonical" href={data.url} />
      </head>
      <body id="root">
        {children}
      </body>
    </html>
  );
}
