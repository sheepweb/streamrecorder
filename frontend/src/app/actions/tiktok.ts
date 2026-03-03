"use server";

import crypto from "crypto";
import { cookies } from "next/headers";

const PKCE_COOKIE = "tiktok_pkce_verifier";

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("hex");
}

export async function getTikTokAuthUrl(
  action: "settings" | "login" | "signup",
) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/callback/tiktok`;
  const scope = "user.info.basic,video.publish,video.upload";

  // Encode action in state so callback knows what to do
  const random = crypto.randomBytes(16).toString("hex");
  const state = `${action}:${random}`;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const cookieStore = await cookies();
  cookieStore.set(PKCE_COOKIE, codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
  });

  return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
}
