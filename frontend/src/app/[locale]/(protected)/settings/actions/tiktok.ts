"use server";

import api from "@/lib/api";

export async function getTikTokConnection() {
  try {
    const response = await api.tiktok.meGetTiktoks();
    const data = response.data?.data;
    if (!data) return null;

    return {
      documentId: data.documentId!,
      connected: true,
    };
  } catch {
    return null;
  }
}

export async function disconnectTikTok(id: string) {
  try {
    const response = await api.tiktok.meGetTiktoks();
    const tiktokData = response.data?.data;

    if (tiktokData?.accessToken) {
      await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token: tiktokData.accessToken,
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        }),
      });
    }

    await api.tiktok.meDeleteTiktoksId({ id });
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting TikTok:", error);
    return { success: false, error: "Failed to disconnect TikTok" };
  }
}
