import {
  formatSocialCount,
  SOCIAL_ICON_IMAGE,
  type SocialPreview,
} from "../../../lib/social-preview";
import type { PublicPlayerProfile } from "../types";

export function buildProfileSocialPreview(
  profile: PublicPlayerProfile,
  path: string,
): SocialPreview {
  const winRate = profile.gamesPlayed
    ? Math.round((profile.wins / profile.gamesPlayed) * 100)
    : 0;
  const parts = [`${profile.mmr} MMR`];
  if (profile.leaderboardRank > 0) {
    parts.push(
      profile.leaderboardTotal > 0
        ? `#${profile.leaderboardRank} of ${formatSocialCount(profile.leaderboardTotal)}`
        : `#${profile.leaderboardRank}`,
    );
  }
  parts.push(
    `${formatSocialCount(profile.gamesPlayed)} ${profile.gamesPlayed === 1 ? "duel" : "duels"}`,
    `${winRate}% duel win rate`,
  );
  const avatar = publicImageURL(profile.avatarUrl);
  return {
    title: `${profile.displayName} | GeoDuels`,
    description: parts.join(" · "),
    canonicalPath: path,
    robots: "index,follow",
    ...(avatar
      ? {
          imagePath: avatar,
          imageWidth: 256,
          imageHeight: 256,
          imageType: "",
          twitterCard: "summary" as const,
        }
      : SOCIAL_ICON_IMAGE),
  };
}

function publicImageURL(value?: string) {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return enlargeAvatarURL(url);
  } catch {
    return "";
  }
}

function enlargeAvatarURL(url: URL) {
  const host = url.hostname;
  if (host.endsWith("googleusercontent.com")) {
    url.pathname = url.pathname.replace(/=s\d+(-c)?$/, "=s512$1");
    return url.toString();
  }
  if (host === "cdn.discordapp.com" || host === "cdn.discord.com") {
    url.searchParams.set("size", "512");
    return url.toString();
  }
  return url.toString();
}
