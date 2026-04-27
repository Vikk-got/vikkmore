import { NextResponse } from "next/server";
import { getUserLibraryCollection } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const collection = await getUserLibraryCollection();

    const doc = await collection.findOne(
      { userId },
      { projection: { _id: 0, likedSongs: 1, playlists: 1, recentSongs: 1, apiKey: 1 } }
    );

    return NextResponse.json({
      likedSongs: doc?.likedSongs || [],
      playlists: doc?.playlists || [],
      recentSongs: doc?.recentSongs || [],
      apiKey: doc?.apiKey || "",
    });
  } catch (error) {
    console.error("user-data api error (GET)", error);
    return NextResponse.json({ error: "Failed to process library request" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const userId = body?.userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const collection = await getUserLibraryCollection();

    const likedSongs = Array.isArray(body?.likedSongs) ? body.likedSongs : [];
    const playlists = Array.isArray(body?.playlists) ? body.playlists : [];
    const recentSongs = Array.isArray(body?.recentSongs) ? body.recentSongs : [];
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
    const now = new Date();

    const setFields: Record<string, unknown> = {
      userId,
      likedSongs,
      playlists,
      recentSongs,
      updatedAt: now,
    };
    if (apiKey !== undefined) setFields.apiKey = apiKey;

    await collection.updateOne(
      { userId },
      {
        $set: setFields,
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("user-data api error (PUT)", error);
    return NextResponse.json({ error: "Failed to process library request" }, { status: 500 });
  }
}
