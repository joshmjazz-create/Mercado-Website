import { useState, useEffect, useRef } from "react";
import { ExternalLink, Play, Pause } from "lucide-react";
import { FaSpotify, FaApple, FaYoutube } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

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
    const fetchMusicData = async () => {
      try {
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";

        // Google Doc IDs
        const MY_MUSIC_DOC_ID = "1rPGjdTrPG3pqmPdstqgl95K0L8kKtJ6qPftO6yTAMxY";
        const FEATURED_ON_DOC_ID = "1JyOjg2kg3YcW6L9DGzgO99rd2WD1oQ9qwNnq2aJrTsE";

        const categories = [
          { name: "My Music", docId: MY_MUSIC_DOC_ID },
          { name: "Featured On", docId: FEATURED_ON_DOC_ID },
        ];

        const allAlbums: Album[] = [];

        for (const category of categories) {
          const docAlbums = await fetchDocumentAlbums(category.docId, category.name);
          allAlbums.push(...docAlbums);
        }

        // Fetch upcoming albums from the folder
        const UPCOMING_FOLDER_ID = "1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";
        const upcomingAlbums = await fetchUpcomingAlbums(UPCOMING_FOLDER_ID);
        allAlbums.push(...upcomingAlbums);

        setAlbums(allAlbums);
      } catch (error) {
        console.error("Error fetching music data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  // Scroll fade effect
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    const handleScroll = () => {
      scrollElement.classList.add("scrolling");
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        scrollElement.classList.remove("scrolling");
      }, 2000);
    };
    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const fetchDocumentAlbums = async (docId: string, categoryName: string): Promise<Album[]> => {
    try {
      const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
      if (!response.ok) throw new Error("Failed to fetch document");
      const text = await response.text();
      const lines = text.split("\n").filter(line => line.trim());

      const albums: Album[] = [];
      let currentAlbum: any = null;
      let inLinksSection = false;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("TITLE:")) {
          if (currentAlbum) albums.push(currentAlbum);
          currentAlbum = { title: trimmed.replace("TITLE:", "").trim(), links: {}, category: categoryName, artist: "Joshua Mercado", year: new Date().getFullYear().toString() };
          inLinksSection = false;
        } else if (trimmed.startsWith("ARTIST:") && currentAlbum) {
          currentAlbum.artist = trimmed.replace("ARTIST:", "").trim();
        } else if (trimmed.startsWith("YEAR:") && currentAlbum) {
          currentAlbum.year = trimmed.replace("YEAR:", "").trim();
        } else if (trimmed === "LINKS:" && currentAlbum) {
          inLinksSection = true;
        } else if (inLinksSection && trimmed.includes(" - ") && currentAlbum) {
          const [platform, url] = trimmed.split(" - ");
          const key = platform.trim().toLowerCase();
          if (key === "spotify") currentAlbum.links.spotify = url.trim();
          else if (key.includes("apple")) currentAlbum.links.applemusic = url.trim();
          else if (key === "youtube") currentAlbum.links.youtube = url.trim();
        }
      }
      if (currentAlbum) albums.push(currentAlbum);

      // Fetch Spotify cover art
      for (const album of albums) {
        if (!album.coverImageUrl && album.links.spotify) {
          album.coverImageUrl = await fetchSpotifyCoverArt(album.links.spotify);
        }
      }

      return albums;
    } catch (error) {
      console.error("Error fetching document albums:", error);
      return [];
    }
  };

  const fetchUpcomingAlbums = async (folderId: string): Promise<Album[]> => {
    try {
      const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`);
      const data = await res.json();
      const upcomingFolders = data.files || [];
      const albums: Album[] = [];

      for (const folder of upcomingFolders) {
        const filesRes = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`);
        const filesData = await filesRes.json();
        const files = filesData.files || [];

        const imageFile = files.find((f: any) => f.mimeType?.startsWith("image/"));
        const audioFile = files.find((f: any) => f.mimeType?.startsWith("audio/"));

        albums.push({
          id: folder.id,
          title: folder.name,
          artist: "Joshua Mercado",
          year: new Date().getFullYear().toString(),
          category: "Upcoming",
          imageFileUrl: imageFile ? `https://lh3.googleusercontent.com/d/${imageFile.id}` : undefined,
          audioPreviewUrl: audioFile ? `https://www.googleapis.com/drive/v3/files/${audioFile.id}?alt=media&key=${API_KEY}` : undefined,
          links: {},
        });
      }

      return albums;
    } catch (error) {
      console.error("Error fetching upcoming albums:", error);
      return [];
    }
  };

  const fetchSpotifyCoverArt = async (spotifyUrl: string): Promise<string> => {
    try {
      const match = spotifyUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
      if (!match) return "";
      const [, type, id] = match;
      const res = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`);
      if (!res.ok) return "";
      const data = await res.json();
      return data.thumbnail_url || "";
    } catch {
      return "";
    }
  };

  const handleAlbumClick = (album: Album) => {
    if (album.category === "Upcoming") handlePlayPreview(album);
    else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handlePlayPreview = async (album: Album) => {
    if (!album.audioPreviewUrl) return;
    if (playingAudio === album.id) {
      const audio = audioElements.get(album.id);
      if (audio) {
        audio.pause();
        setPlayingAudio(null);
      }
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
      audio.preload = "auto";
      setAudioElements(prev => new Map(prev.set(album.id, audio)));
      audio.addEventListener("error", e => {
        console.error("Audio error for", album.title, e);
        setLoadingAudio(null);
        setPlayingAudio(null);
      });
      audio.addEventListener("canplaythrough", () => setLoadingAudio(null));
      audio.addEventListener("ended", () => setPlayingAudio(null));
    }

    const startPlayback = () => {
      const startTime = audio!.duration / 3;
      audio!.currentTime = startTime;
      audio!.volume = 0;
      audio!.play().then(() => {
        setPlayingAudio(album.id);
        const fadeIn = setInterval(() => {
          if (audio!.volume < 1) audio!.volume = Math.min(1, audio!.volume + 0.05);
          else clearInterval(fadeIn);
        }, 50);

        setTimeout(() => {
          const fadeOut = setInterval(() => {
            if (audio!.volume > 0) audio!.volume = Math.max(0, audio!.volume - 0.05);
            else {
              clearInterval(fadeOut);
              audio!.pause();
              setPlayingAudio(null);
            }
          }, 50);
        }, 15000);
      });
    };

    if (audio!.readyState >= 4) startPlayback();
    else audio!.addEventListener("canplaythrough", startPlayback, { once: true });
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, "_blank");
    setShowPlatforms(false);
  };

  const myMusicAlbums = albums.filter(a => a.category === "My Music");
  const featuredAlbums = albums.filter(a => a.category === "Featured On");
  const upcomingAlbums = albums.filter(a => a.category === "Upcoming");

  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* My Music Section */}
            {myMusicAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "400ms" }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline">{`My Music`}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {myMusicAlbums.map((album, index) => (
                    <div key={`${album.title}-${index}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAlbumClick(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.coverImageUrl ? (
                            <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
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

            {/* Featured On Section */}
            {featuredAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "600ms" }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline">{`Featured On`}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {featuredAlbums.map((album, index) => (
                    <div key={`${album.title}-${index}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAlbumClick(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.coverImageUrl ? (
                            <img src={album.coverImageUrl} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
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

            {/* Upcoming Section */}
            {upcomingAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "800ms" }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline">{`Upcoming`}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {upcomingAlbums.map((album, index) => (
                    <div key={`${album.title}-${index}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handlePlayPreview(album)}>
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                        <div className="aspect-square relative">
                          {album.imageFileUrl ? (
                            <img src={album.imageFileUrl} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                              <span className="text-gray-600 text-sm">No Cover</span>
                            </div>
                          )}
                          {album.audioPreviewUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              {loadingAudio === album.id ? (
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                </div>
                              ) : playingAudio === album.id ? (
                                <div className="bg-black bg-opacity-50 rounded-full p-3">
                                  <Pause className="w-8 h-8 text-white" />
                                </div>
                              ) : (
                                <div className="bg-black bg-opacity-50 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
                          {album.audioPreviewUrl && <p className="text-purple-600 text-sm font-medium">Preview Available</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Platform Dialog */}
        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="bg-white border-purple-800">
            <div className="flex justify-center mb-6">
              {selectedAlbum?.coverImageUrl || selectedAlbum?.imageFileUrl ? (
                <img src={selectedAlbum.coverImageUrl || selectedAlbum.imageFileUrl} alt={selectedAlbum.title} className="w-48 h-48 object-cover rounded-lg shadow-lg" />
              ) :
