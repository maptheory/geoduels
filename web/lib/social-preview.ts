export type SocialPreview = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  imageType: string;
  twitterCard: "summary" | "summary_large_image";
};

export const SOCIAL_ICON_IMAGE = {
  imagePath: "/icon.v1.png",
  imageWidth: 256,
  imageHeight: 256,
  imageType: "image/png",
  twitterCard: "summary" as const,
};

export function absolutePreviewURL(siteURL: string, value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${siteURL}${path}`;
}

export function formatSocialCount(value: number) {
  if (value < 1000) return String(value);
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: value < 10000 ? 1 : 0,
  }).format(value);
}
