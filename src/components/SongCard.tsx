import { Play, X } from "lucide-react";
import type { Song } from "@/lib/storage";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SongCardProps {
  song: Song;
  queue?: Song[];
  skipAuth?: boolean;
  onDelete?: () => void;
}

const SongCard = ({ song, queue, skipAuth, onDelete }: SongCardProps) => {
  const { playSong } = usePlayer();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();

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
      className="group bg-card hover:bg-accent/60 rounded-lg p-4 cursor-pointer transition-all duration-200 relative"
    >
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/60 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
          title="Remove from history"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="relative mb-4">
        <img src={song.thumbnail} alt="" className="w-full aspect-square rounded-md object-cover shadow-lg" />
        <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
        </button>
      </div>
      <p className="text-sm font-semibold text-card-foreground truncate">{song.title}</p>
      <p className="text-xs text-muted-foreground truncate mt-1">{song.artist}</p>
    </div>
  );
};

export default SongCard;
