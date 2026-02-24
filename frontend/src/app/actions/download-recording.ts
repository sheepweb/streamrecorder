"use server";

export async function downloadRecording(
  videoDocumentId: string,
  userId: number,
  locale: string
): Promise<void> {
  await fetch(process.env.N8N_URL + "/webhook/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.N8N_TOKEN}`,
    },
    body: JSON.stringify({
      videoDocumentId,
      userId,
      locale,
    }),
  });
}
