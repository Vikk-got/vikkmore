import { Play, Heart, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import type { Song } from "@/lib/storage";
import { isLiked, toggleLike, getPlaylists, addToPlaylist, subscribeToLibraryChanges, type Playlist } from "@/lib/storage";
import { usePlayer } from "@/context/PlayerContext";
import { useEffect, useState } from "react";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SongRowProps {
  song: Song;
  index: number;
  queue?: Song[];
  onLikeChange?: () => void;
  onDelete?: () => void;
  skipAuth?: boolean;
}

const SongRow = ({ song, index, queue, onLikeChange, onDelete, skipAuth }: SongRowProps) => {
  const { playSong, currentSong } = usePlayer();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const isActive = currentSong?.id === song.id;

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      const [likedState, nextPlaylists] = await Promise.all([isLiked(song.id), getPlaylists()]);
      if (!mounted) return;
      setLiked(likedState);
      setPlaylists(nextPlaylists);
    };

    void refresh();
    const unsubscribe = subscribeToLibraryChanges(() => {
      void refresh();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [song.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = await toggleLike(song);
    setLiked(newState);
    onLikeChange?.();
  };

  const handleClick = () => {
    if (!isSignedIn && !skipAuth) {
      openSignIn();
      return;
    }
    playSong(song, queue);
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-3 px-4 py-1.5 rounded-md cursor-pointer transition-colors ${
        isActive ? "bg-accent" : "hover:bg-accent/50"
      }`}
    >
      <div className="w-6 text-center">
        <span className="group-hover:hidden text-xs text-muted-foreground">{index + 1}</span>
        <Play className="w-3.5 h-3.5 hidden group-hover:block mx-auto text-foreground" />
      </div>

      <img src={song.thumbnail} alt="" className="w-9 h-9 rounded object-cover" />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium whitespace-normal break-words leading-snug ${
            isActive ? "text-primary" : "text-foreground"
          }`}
        >
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground whitespace-normal break-words leading-snug">
          Song · {song.artist}
        </p>
      </div>

      <button onClick={handleLike} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className={`w-4 h-4 ${liked ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground"}`} />
      </button>

      <div className="relative flex items-center gap-2">
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
            title="Remove from history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-6 z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[160px]"
            onMouseLeave={() => setShowMenu(false)}>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={(e) => {
                  e.stopPropagation();
                  void addToPlaylist(pl.id, song);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> {pl.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongRow;
