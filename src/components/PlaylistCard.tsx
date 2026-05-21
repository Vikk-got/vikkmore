import { Play } from "lucide-react";
import type { PlaylistResult } from "@/lib/youtube";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface PlaylistCardProps {
  playlist: PlaylistResult;
  onClick: (id: string) => void;
}

const PlaylistCard = ({ playlist, onClick }: PlaylistCardProps) => {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const handleClick = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    onClick(playlist.id);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-card hover:bg-accent/60 rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-200"
    >
      <div className="relative mb-3 md:mb-4">
        <img 
          src={playlist.thumbnail} 
          alt={playlist.title} 
          className="w-full aspect-square rounded-md object-cover shadow-lg" 
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
        <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
        </button>
      </div>
      <p className="text-sm font-semibold text-card-foreground truncate">{playlist.title}</p>
      <p className="text-xs text-muted-foreground truncate mt-1">{playlist.channelTitle}</p>
    </div>
  );
};

export default PlaylistCard;
