import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { PlayerProfilePage } from "../../features/players/components/PlayerProfilePage";
import type { PublicPlayerProfile } from "../../features/players/types";
import { readServerConfig } from "../../lib/runtime-config.server";
import { loadPublicProfilePreview } from "../../lib/social-preview-load";

type PlayerRouteProps = {
  playerId: string;
  initialProfile: PublicPlayerProfile | null;
  previewMissing: boolean;
};

export const getServerSideProps: GetServerSideProps<PlayerRouteProps> = async (ctx) => {
  const playerId = typeof ctx.params?.id === "string" ? ctx.params.id.trim() : "";
  const loaded = await loadPublicProfilePreview(readServerConfig(), playerId);
  return {
    props: {
      playerId,
      initialProfile: loaded.profile,
      previewMissing: loaded.missing,
    },
  };
};

export default function PlayerRoute({
  playerId,
  initialProfile,
  previewMissing,
}: PlayerRouteProps) {
  const router = useRouter();
  const routedId = typeof router.query.id === "string" ? router.query.id.trim() : "";
  return (
    <PlayerProfilePage
      playerId={routedId || playerId}
      initialProfile={initialProfile || undefined}
      previewMissing={previewMissing}
    />
  );
}
