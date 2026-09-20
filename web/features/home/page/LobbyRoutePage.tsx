import { SocialPreviewHead } from "../../../components/SocialPreviewHead";
import {
  SOCIAL_ICON_IMAGE,
  type SocialPreview,
} from "../../../lib/social-preview";

type LobbyRoutePageProps = {
  title: string;
  description: string;
  canonicalPath: string;
  preview?: SocialPreview;
};

export default function LobbyRoutePage({
  title,
  description,
  canonicalPath,
  preview,
}: LobbyRoutePageProps) {
  return (
    <SocialPreviewHead
      {...(preview || {
        title,
        description,
        canonicalPath,
        robots: "index,follow",
        ...SOCIAL_ICON_IMAGE,
      })}
    />
  );
}
