export interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface UserLibraryData {
  likedSongs: Song[];
  playlists: Playlist[];
  recentSongs: Song[];
  apiKey: string;
}

const STORAGE_SYNC_EVENT = "vikkmore-library-sync";
const USER_ID_KEY = "vikkmore-user-id";
const API_KEY_KEY = "spotify-clone-api-key";
const LIKED_KEY = "spotify-clone-liked";
const PLAYLISTS_KEY = "spotify-clone-playlists";
const RECENT_KEY = "spotify-clone-recent";

const EMPTY_LIBRARY: UserLibraryData = {
  likedSongs: [],
  playlists: [],
  recentSongs: [],
  apiKey: "",
};

let cache: UserLibraryData = { ...EMPTY_LIBRARY };
let cacheReady = false;
let pendingLoad: Promise<UserLibraryData> | null = null;

const getApiBaseUrl = () => (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE_URL : "") || "";

const emitLibrarySync = () => {
  window.dispatchEvent(new Event(STORAGE_SYNC_EVENT));
};

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const dedupeSongs = (songs: Song[]) => {
  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.id)) return false;
    seen.add(song.id);
    return true;
  });
};

const mergePlaylists = (playlists: Playlist[]) => {
  const byId = new Map<string, Playlist>();

  for (const playlist of playlists) {
    const existing = byId.get(playlist.id);
    const next = {
      ...playlist,
      songs: dedupeSongs(playlist.songs || []),
    };

    if (!existing) {
      byId.set(playlist.id, next);
      continue;
    }

    byId.set(playlist.id, {
      ...existing,
      ...next,
      songs: dedupeSongs([...existing.songs, ...next.songs]),
    });
  }

  return Array.from(byId.values()).sort((a, b) => a.createdAt - b.createdAt);
};

const normalizeLibrary = (data?: Partial<UserLibraryData>): UserLibraryData => ({
  likedSongs: dedupeSongs(data?.likedSongs || []),
  playlists: mergePlaylists(data?.playlists || []),
  recentSongs: dedupeSongs(data?.recentSongs || []).slice(0, 30),
  apiKey: data?.apiKey || "",
});

const readLegacyLibrary = (): UserLibraryData =>
  normalizeLibrary({
    likedSongs: typeof window !== 'undefined' ? safeParse<Song[]>(localStorage.getItem(LIKED_KEY), []) : [],
    playlists: typeof window !== 'undefined' ? safeParse<Playlist[]>(localStorage.getItem(PLAYLISTS_KEY), []) : [],
    recentSongs: typeof window !== 'undefined' ? safeParse<Song[]>(localStorage.getItem(RECENT_KEY), []) : [],
  });

const clearLegacyLibrary = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LIKED_KEY);
    localStorage.removeItem(PLAYLISTS_KEY);
    localStorage.removeItem(RECENT_KEY);
  }
};

export const setClerkUserId = (clerkId: string) => {
  if (typeof window === 'undefined') return;
  const current = localStorage.getItem(USER_ID_KEY);
  if (current !== clerkId) {
    localStorage.setItem(USER_ID_KEY, clerkId);
    cache = { ...EMPTY_LIBRARY };
    cacheReady = false;
    pendingLoad = null;
    // Notify all subscribers to re-fetch with the new user's data
    window.dispatchEvent(new Event(STORAGE_SYNC_EVENT));
  }
};

const ensureUserId = (): string => {
  if (typeof window === 'undefined') return "ssr-user-id";
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, next);
  return next;
};

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${input}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Failed to sync library");
  }

  return response.json() as Promise<T>;
};

const saveRemoteLibrary = async (data: UserLibraryData) => {
  const userId = ensureUserId();
  await request<UserLibraryData>("/api/user-data", {
    method: "PUT",
    body: JSON.stringify({ userId, ...data }),
  });
};

export const loadUserLibrary = async (force = false): Promise<UserLibraryData> => {
  if (cacheReady && !force) return cache;
  if (pendingLoad && !force) return pendingLoad;

  const userId = ensureUserId();

  pendingLoad = (async () => {
    try {
      const remote = normalizeLibrary(
        await request<Partial<UserLibraryData>>(`/api/user-data?userId=${encodeURIComponent(userId)}`)
      );
      const legacy = readLegacyLibrary();
      const merged = normalizeLibrary({
        likedSongs: [...legacy.likedSongs, ...remote.likedSongs],
        playlists: [...remote.playlists, ...legacy.playlists],
        recentSongs: [...legacy.recentSongs, ...remote.recentSongs],
        apiKey: remote.apiKey || legacy.apiKey || "",
      });

      cache = merged;
      cacheReady = true;

      const hasLegacyData =
        legacy.likedSongs.length > 0 || legacy.playlists.length > 0 || legacy.recentSongs.length > 0;

      if (hasLegacyData) {
        await saveRemoteLibrary(cache).catch((err) =>
          console.error("Failed to sync migrated data to remote", err)
        );
        clearLegacyLibrary();
      }

      return cache;
    } catch (error) {
      console.error("Failed to load user library from remote, falling back to local", error);
      // Fallback to legacy data only
      const legacy = readLegacyLibrary();
      cache = legacy;
      cacheReady = true;
      return cache;
    }
  })();

  try {
    return await pendingLoad;
  } finally {
    pendingLoad = null;
  }
};

const updateLibrary = async (updater: (current: UserLibraryData) => UserLibraryData) => {
  const current = await loadUserLibrary();
  const next = normalizeLibrary(updater(current));
  cache = next;
  try {
    await saveRemoteLibrary(next);
  } catch (error) {
    console.error("Failed to sync library update to remote", error);
  }
  emitLibrarySync();
  return next;
};

export const subscribeToLibraryChanges = (callback: () => void) => {
  const listener = () => callback();
  window.addEventListener(STORAGE_SYNC_EVENT, listener);
  return () => window.removeEventListener(STORAGE_SYNC_EVENT, listener);
};

export const getLikedSongs = async (): Promise<Song[]> => {
  const library = await loadUserLibrary();
  return library.likedSongs;
};

export const toggleLike = async (song: Song): Promise<boolean> => {
  let liked = false;

  await updateLibrary((current) => {
    const exists = current.likedSongs.some((item) => item.id === song.id);
    liked = !exists;

    return {
      ...current,
      likedSongs: exists
        ? current.likedSongs.filter((item) => item.id !== song.id)
        : [song, ...current.likedSongs],
    };
  });

  return liked;
};

export const isLiked = async (id: string): Promise<boolean> => {
  const songs = await getLikedSongs();
  return songs.some((song) => song.id === id);
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const library = await loadUserLibrary();
  return library.playlists;
};

export const createPlaylist = async (name: string, songs: Song[] = []): Promise<Playlist> => {
  const playlist: Playlist = {
    id: crypto.randomUUID(),
    name,
    songs: dedupeSongs(songs),
    createdAt: Date.now(),
  };

  await updateLibrary((current) => ({
    ...current,
    playlists: [...current.playlists, playlist],
  }));

  return playlist;
};

export const addToPlaylist = async (playlistId: string, song: Song) => {
  await updateLibrary((current) => ({
    ...current,
    playlists: current.playlists.map((playlist) =>
      playlist.id !== playlistId || playlist.songs.some((item) => item.id === song.id)
        ? playlist
        : { ...playlist, songs: [...playlist.songs, song] }
    ),
  }));
};

export const removeFromPlaylist = async (playlistId: string, songId: string) => {
  await updateLibrary((current) => ({
    ...current,
    playlists: current.playlists.map((playlist) =>
      playlist.id !== playlistId
        ? playlist
        : {
            ...playlist,
            songs: playlist.songs.filter((song) => song.id !== songId),
          }
    ),
  }));
};

export const deletePlaylist = async (playlistId: string) => {
  await updateLibrary((current) => ({
    ...current,
    playlists: current.playlists.filter((playlist) => playlist.id !== playlistId),
  }));
};

export const getRecentSongs = async (): Promise<Song[]> => {
  const library = await loadUserLibrary();
  return library.recentSongs;
};

export const addToRecent = async (song: Song) => {
  await updateLibrary((current) => ({
    ...current,
    recentSongs: [song, ...current.recentSongs.filter((item) => item.id !== song.id)].slice(0, 30),
  }));
};

export const clearRecentSongs = async () => {
  await updateLibrary((current) => ({
    ...current,
    recentSongs: [],
  }));
};

export const removeFromRecent = async (songId: string) => {
  await updateLibrary((current) => ({
    ...current,
    recentSongs: current.recentSongs.filter((song) => song.id !== songId),
  }));
};

let cachedApiKey: string | null = null;

export const getApiKey = async (): Promise<string> => {
  if (cachedApiKey) return cachedApiKey;

  // 1. Try to fetch from server env if in browser
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch("/api/youtube-key");
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          cachedApiKey = data.apiKey;
          return data.apiKey;
        }
      }
    } catch (e) {
      console.error("Failed to fetch API key from server", e);
    }
  } else {
    // on server side
    const key = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "";
    if (key) return key;
  }

  // 2. Fallback to MongoDB / User Library stored key
  const library = await loadUserLibrary();
  if (library.apiKey) {
    cachedApiKey = library.apiKey;
    return library.apiKey;
  }

  // 3. Fallback to localStorage
  if (typeof window !== 'undefined') {
    const key = localStorage.getItem(API_KEY_KEY) || "";
    if (key) {
      cachedApiKey = key;
      return key;
    }
  }

  return "";
};

export const setApiKey = async (key: string): Promise<void> => {
  cachedApiKey = key;
  await updateLibrary((current) => ({ ...current, apiKey: key }));
  // clear legacy localStorage key
  if (typeof window !== 'undefined') localStorage.removeItem(API_KEY_KEY);
};
