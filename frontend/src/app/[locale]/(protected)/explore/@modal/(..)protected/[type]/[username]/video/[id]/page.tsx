import { checkVideoAccess } from "@/app/actions/video-access";
import { VideoUpgradeModalWrapper } from "@/app/[locale]/(protected)/components/video-upgrade-modal-wrapper";
import RecordingModalClient from "./recording-modal.client";

export default async function RecordingModal({
  params,
}: {
  params: Promise<{ id: string; username: string; type: string }>;
}) {
  const { id } = await params;
  const access = await checkVideoAccess(id);

  if (!access.allowed) {
    return <VideoUpgradeModalWrapper />;
  }

  return <RecordingModalClient />;
}
