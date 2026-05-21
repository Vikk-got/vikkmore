import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Trash2, AlertCircle, ArrowRight } from "lucide-react";
import { getTrendingMusic } from "@/lib/youtube";
import { 
  getRecentSongs, 
  getApiKey, 
  subscribeToLibraryChanges, 
  clearRecentSongs, 
  removeFromRecent, 
  type Song 
} from "@/lib/storage";
import SongCard from "@/components/SongCard";
import SongRow from "@/components/SongRow";
import PlaylistCard from "@/components/PlaylistCard";
import PageSEO from "@/components/SEO/PageSEO";
import { searchYouTube, searchYouTubePlaylists, type PlaylistResult } from "@/lib/youtube";
import { SAMPLE_SONGS } from "@/lib/constants";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

const HomeView = ({ onNavigate }: HomeViewProps) => {
  const [trending, setTrending] = useState<Song[]>([]);
  const [popularPlaylists, setPopularPlaylists] = useState<PlaylistResult[]>([]);
  const [popularSongs, setPopularSongs] = useState<Song[]>([]);
  const [recent, setRecent] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [greetingText, setGreetingText] = useState("");

  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    setMounted(true);
    const checkKey = async () => {
      const key = await getApiKey();
      setHasKey(!!key);
    };
    checkKey();

    const h = new Date().getHours();
    if (h < 12) setGreetingText("Good Listening");
    else if (h < 18) setGreetingText("Good Listening");
    else setGreetingText("Good Listening");
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const loadRecent = async () => {
      const nextRecent = await getRecentSongs();
      if (isSubscribed) setRecent(nextRecent);
    };

    void loadRecent();
    const unsubscribe = subscribeToLibraryChanges(() => {
      void loadRecent();
      void (async () => {
        const key = await getApiKey();
        if (isSubscribed) setHasKey(!!key);
      })();
    });

    if (hasKey) {
      setLoading(true);
      Promise.all([
        getTrendingMusic(),
        searchYouTubePlaylists("Music Playlists 2024"),
        searchYouTube("Top Global Songs 2024")
      ]).then(([trendingData, playlistData, popularData]) => {
        if (isSubscribed) {
          setTrending(trendingData);
          setPopularPlaylists(playlistData.slice(0, 10));
          setPopularSongs(popularData.slice(0, 10));
        }
      }).catch(err => {
        console.error("Failed to fetch home content", err);
      }).finally(() => {
        if (isSubscribed) setLoading(false);
      });
    } else {
      setTrending(SAMPLE_SONGS.slice(0, 10));
      setPopularPlaylists([]);
      setPopularSongs([]);
    }

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [hasKey]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  if (!mounted) {
    return <div className="p-4 md:p-6 space-y-6 md:space-y-8 h-full bg-background" />;
  }

  // We no longer show a blocked screen, we show sample songs instead
  // if (!hasKey) { ... }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 overflow-y-auto scrollbar-thin h-full pb-24 md:pb-6">
      <PageSEO 
        title="Vikkmore - Free YouTube Music Player & Playlist Manager"
        description="Vikkmore is the best free YouTube music player with playlist management. Stream millions of songs, create custom playlists, and enjoy ad-free music experience. No downloads required."
        keywords="vikkmore, youtube music player, free music streaming, playlist manager, online music player, youtube audio, music streaming service, create playlists, music library"
      />
      
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{greetingText}</h1>

      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Recently Played</h2>
            <button 
              onClick={() => clearRecentSongs()}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {recent.slice(0, 10).map((song) => (
              <SongCard 
                key={song.id} 
                song={song} 
                queue={recent} 
                onDelete={() => removeFromRecent(song.id)}
              />
            ))}
          </div>
        </section>
      )}



      {!hasKey && (
        <section>
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Trending Songs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {SAMPLE_SONGS.map((song) => (
              <SongCard key={song.id} song={song} queue={SAMPLE_SONGS} skipAuth={true} />
            ))}
          </div>
        </section>
      )}

      {hasKey && popularPlaylists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Featured Playlists</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {popularPlaylists.map((playlist) => (
                <PlaylistCard 
                  key={playlist.id} 
                  playlist={playlist} 
                  onClick={(id) => onNavigate(`playlist/${id}`)} 
                />
              ))}
            </div>
          )}
        </section>
      )}

      {hasKey && popularSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Popular Songs</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {popularSongs.map((song) => (
                <SongCard key={song.id} song={song} queue={popularSongs} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Trending Now</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-card animate-pulse rounded-md" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {trending.map((song, i) => (
              <SongRow 
                key={song.id} 
                song={song} 
                index={i} 
                queue={trending} 
                skipAuth={!hasKey} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
