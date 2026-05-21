import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
  return NextResponse.json({ apiKey });
}
