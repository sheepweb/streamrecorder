import publicApi from "@/lib/public-api";
import { Container } from "@mantine/core";
import { notFound } from "next/navigation";
import VideoEditor from "./video-editor";

interface Props {
  params: Promise<{ type: string; username: string; id: string }>;
}

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params;

  const { data } = await publicApi.recording.getRecordingsId(
    { id },
    {
      query: {
        populate: {
          sources: { fields: ["*"] },
          follower: {
            fields: ["username", "type"],
            populate: ["owner"],
          },
        },
      },
    } as never,
  );

  const recording = data?.data;

  if (!recording) {
    notFound();
  }

  return (
    <Container size="lg" py="md">
      <VideoEditor recording={recording} />
    </Container>
  );
}
