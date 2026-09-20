import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { getLobbyLayout } from "../../features/home/page/LobbyApplicationLayout";
import LobbyRoutePage from "../../features/home/page/LobbyRoutePage";
import { buildMapSocialPreview } from "../../features/maps/lib/map-social-preview";
import {
  normalizeEntityRouteId,
  toPublicEntityId,
} from "../../lib/entity-id";
import { readServerConfig } from "../../lib/runtime-config.server";
import { loadPublicMapPreview } from "../../lib/social-preview-load";
import type { SocialPreview } from "../../lib/social-preview";
import type { NextPageWithLayout } from "../_app";

type MapDetailsRouteProps = {
  preview: SocialPreview;
};

export const getServerSideProps: GetServerSideProps<MapDetailsRouteProps> = async (ctx) => {
  const routeId = typeof ctx.params?.id === "string" ? ctx.params.id.trim() : "";
  const details = await loadPublicMapPreview(readServerConfig(), routeId);
  return {
    props: {
      preview: buildMapSocialPreview(
        details?.map || null,
        details?.countryStats || null,
        routeId,
      ),
    },
  };
};

const MapDetailsRoute: NextPageWithLayout<MapDetailsRouteProps> = function MapDetailsRoute({
  preview,
}) {
  const router = useRouter();
  const mapId =
    router.isReady && typeof router.query.id === "string"
      ? normalizeEntityRouteId(router.query.id)
      : "";

  return (
    <LobbyRoutePage
      title={preview.title}
      description={preview.description}
      canonicalPath={
        mapId
          ? `/maps/${encodeURIComponent(toPublicEntityId(mapId))}`
          : preview.canonicalPath
      }
      preview={preview}
    />
  );
};

MapDetailsRoute.getLayout = getLobbyLayout;

export default MapDetailsRoute;
