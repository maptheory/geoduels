import Head from "next/head";
import {
  absolutePreviewURL,
  type SocialPreview,
} from "../lib/social-preview";
import { useSiteURL } from "../lib/site";

export function SocialPreviewHead(preview: SocialPreview) {
  const siteURL = useSiteURL();
  const canonicalURL = `${siteURL}${preview.canonicalPath}`;
  const imageURL = absolutePreviewURL(siteURL, preview.imagePath);

  return (
    <Head>
      <title>{preview.title}</title>
      <meta name="description" content={preview.description} />
      <meta name="robots" content={preview.robots} />
      <link rel="canonical" href={canonicalURL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GeoDuels" />
      <meta property="og:title" content={preview.title} />
      <meta property="og:description" content={preview.description} />
      <meta property="og:url" content={canonicalURL} />
      <meta property="og:image" content={imageURL} />
      <meta property="og:image:width" content={String(preview.imageWidth)} />
      <meta property="og:image:height" content={String(preview.imageHeight)} />
      {preview.imageType ? (
        <meta property="og:image:type" content={preview.imageType} />
      ) : null}
      <meta property="og:image:alt" content={preview.title} />
      <meta name="twitter:card" content={preview.twitterCard} />
      <meta name="twitter:title" content={preview.title} />
      <meta name="twitter:description" content={preview.description} />
      <meta name="twitter:image" content={imageURL} />
    </Head>
  );
}
