import { useState, useEffect, useRef } from "react";
import { ExternalLink, Play, Pause } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  category: string;
  coverImageUrl?: string;
  links: {
    spotify?: string;
    applemusic?: string;
    youtube?: string;
  };
  audioPreviewUrl?: string;
  imageFileUrl?: string;
}

export default function Music() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const scrollRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Music";
  }, []);

  useEffect(() => {
    // Fetch albums logic here
    // (keep your working fetchMusicData logic)
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      scrollElement.classList.add('scrolling');
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => scrollElement.classList.remove('scrolling'), 2000);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleAlbumClick = (album: Album) => {
    if (album.category === 'Upcoming') handlePlayPreview(album);
    else { setSelectedAlbum(album); setShowPlatforms(true); }
  };

  const handlePlayPreview = async (album: Album) => {
    if (!album.audioPreviewUrl) return;

    if (playingAudio === album.id) {
      const audio = audioElements.get(album.id);
      if (audio) { audio.pause(); setPlayingAudio(null); }
      return;
    }

    if (playingAudio) {
      const currentAudio = audioElements.get(playingAudio);
      if (currentAudio) currentAudio.pause();
      setPlayingAudio(null);
    }

    setLoadingAudio(album.id);
    let audio = audioElements.get(album.id);

    if (!audio) {
      audio = new Audio(album.audioPreviewUrl);
      audio.preload = 'auto';
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));
      audio.addEventListener('ended', () => setPlayingAudio(null));
    }

    audio.currentTime = audio.duration / 3;
    audio.volume = 0;
    audio.play().then(() => {
      setPlayingAudio(album.id);
      setLoadingAudio(null);

      const fadeIn = setInterval(() => {
        if (audio!.volume < 1) audio!.volume = Math.min(1, audio!.volume + 0.05);
        else clearInterval(fadeIn);
      }, 50);

      setTimeout(() => {
        const fadeOut = setInterval(() => {
          if (audio!.volume > 0) audio!.volume = Math.max(0, audio!.volume - 0.05);
          else { clearInterval(fadeOut); audio!.pause(); setPlayingAudio(null); }
        }, 50);
      }, 15000);
    });
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const myMusicAlbums = albums.filter(a => a.category === 'My Music');
  const featuredAlbums = albums.filter(a => a.category === 'Featured On');
  const upcomingAlbums = albums.filter(a => a.category === 'Upcoming');

  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>}

        {!isLoading && (
          <>
            {/* --- MY MUSIC --- */}
            {myMusicAlbums.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">My Music</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {myMusicAlbums.map((album, idx) => (
                    <div key={`${album.title}-${idx}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAlbumClick(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.coverImageUrl ? <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center"><span className="text-gray-600 text-sm">No Cover</span></div>}
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          <p className="text-gray-500 text-sm">{album.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FEATURED ON --- */}
            {featuredAlbums.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">Featured On</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {featuredAlbums.map((album, idx) => (
                    <div key={`${album.title}-${idx}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAlbumClick(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.coverImageUrl ? <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center"><span className="text-gray-600 text-sm">No Cover</span></div>}
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          <p className="text-gray-500 text-sm">{album.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- UPCOMING --- */}
            {upcomingAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '800ms' }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">Upcoming</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {upcomingAlbums.map((album, idx) => (
                    <div key={`${album.title}-${idx}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handlePlayPreview(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.imageFileUrl ? <img src={album.imageFileUrl} alt={album.title} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center"><span className="text-gray-600 text-sm">No Cover</span></div>}
                          {album.audioPreviewUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {playingAudio === album.id ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          <p className="text-gray-500 text-sm">{album.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="bg-white border-purple-800">
            {selectedAlbum?.coverImageUrl || selectedAlbum?.imageFileUrl ? (
              <img src={selectedAlbum.coverImageUrl || selectedAlbum.imageFileUrl} alt={selectedAlbum.title} className="w-48 h-48 object-cover rounded-lg shadow-lg mx-auto mb-6" />
            ) : (
              <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-lg shadow-lg mx-auto mb-6"><span className="text-gray-600 text-sm">No Cover</span></div>
            )}
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-4 text-center">{selectedAlbum?.title}</DialogTitle>
            <p className="text-gray-600 text-center mb-4">{selectedAlbum?.artist}</p>
            <p className="text-gray-500 text-center mb-6">{selectedAlbum?.year}</p>
            <div className="grid grid-cols-1 gap-4">
              {selectedAlbum?.links.spotify && <Button variant="outline" onClick={() => handlePlatformClick(selectedAlbum.links.spotify)}><FaSpotify className="mr-2" />Spotify</Button>}
              {selectedAlbum?.links.applemusic && <Button variant="outline" onClick={() => handlePlatformClick(selectedAlbum.links.applemusic)}><FaApple className="mr-2" />Apple Music</Button>}
              {selectedAlbum?.links.youtube && <Button variant="outline" onClick={() => handlePlatformClick(selectedAlbum.links.youtube)}><FaYoutube className="mr-2" />YouTube</Button>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
