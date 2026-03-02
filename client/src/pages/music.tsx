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
  links: { spotify?: string; applemusic?: string; youtube?: string };
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

  // Document IDs
  const MY_MUSIC_DOC_ID = "1rPGjdTrPG3pqmPdstqgl95K0L8kKtJ6qPftO6yTAMxY";
  const FEATURED_ON_DOC_ID = "1JyOjg2kg3YcW6L9DGzgO99rd2WD1oQ9qwNnq2aJrTsE";

  useEffect(() => {
    document.title = "Music";
  }, []);

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const myMusicAlbums = await fetchDocumentAlbums(MY_MUSIC_DOC_ID, "My Music");
        const featuredAlbums = await fetchDocumentAlbums(FEATURED_ON_DOC_ID, "Featured On");
        const upcomingAlbums = await fetchUpcomingAlbums();
        setAlbums([...myMusicAlbums, ...featuredAlbums, ...upcomingAlbums]);
      } catch (error) {
        console.error("Error fetching music data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusicData();
  }, []);

  // Custom scrollbar fade effect
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

  // Fetch albums from a single Google Doc
  const fetchDocumentAlbums = async (docId: string, categoryName: string): Promise<Album[]> => {
    try {
      const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
      if (!response.ok) throw new Error("Failed to fetch document content");
      const text = await response.text();
      const lines = text.split("\n").filter(line => line.trim());

      const albums: Album[] = [];
      let currentAlbum: any = { title: "", artist: "Joshua Mercado", year: new Date().getFullYear().toString(), links: {} };
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("TITLE:")) {
          if (currentAlbum.title) albums.push({ ...currentAlbum, category: categoryName, id: currentAlbum.title }); // Save previous album
          currentAlbum = { title: trimmed.replace("TITLE:", "").trim(), artist: "Joshua Mercado", year: new Date().getFullYear().toString(), links: {} };
        } else if (trimmed.startsWith("ARTIST:")) {
          currentAlbum.artist = trimmed.replace("ARTIST:", "").trim();
        } else if (trimmed.startsWith("YEAR:")) {
          currentAlbum.year = trimmed.replace("YEAR:", "").trim();
        } else if (trimmed.includes(" - ")) {
          const [platform, url] = trimmed.split(" - ");
          const key = platform.trim().toLowerCase();
          if (key === "spotify") currentAlbum.links.spotify = url.trim();
          else if (key.includes("apple")) currentAlbum.links.applemusic = url.trim();
          else if (key === "youtube") currentAlbum.links.youtube = url.trim();
        }
      });
      // Push last album
      if (currentAlbum.title) albums.push({ ...currentAlbum, category: categoryName, id: currentAlbum.title });
      return albums;
    } catch (error) {
      console.error(`Error fetching document (${categoryName}):`, error);
      return [];
    }
  };

  // Fetch Upcoming albums from folder (same as before)
  const fetchUpcomingAlbums = async (): Promise<Album[]> => {
    try {
      const MUSIC_FOLDER_ID = "1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";
      const UPCOMING_FOLDER_NAME = "Upcoming";
      const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";

      const folderRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${MUSIC_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
      );
      if (!folderRes.ok) throw new Error("Failed to fetch Music folder");
      const foldersData = await folderRes.json();
      const upcomingFolder = foldersData.files.find((f: any) => f.name === UPCOMING_FOLDER_NAME);
      if (!upcomingFolder) return [];

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${upcomingFolder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`
      );
      if (!response.ok) throw new Error("Failed to fetch upcoming albums");
      const filesData = await response.json();
      const albums: Album[] = [];
      for (const file of filesData.files) {
        if (file.mimeType?.startsWith("image/")) {
          albums.push({
            id: file.id,
            title: file.name,
            artist: "Joshua Mercado",
            year: new Date().getFullYear().toString(),
            category: "Upcoming",
            imageFileUrl: `https://lh3.googleusercontent.com/d/${file.id}`,
            links: {}
          });
        }
      }
      return albums;
    } catch (error) {
      console.error("Error fetching upcoming albums:", error);
      return [];
    }
  };

  // Play audio preview logic remains unchanged
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
      if (currentAudio) {
        currentAudio.pause();
        setPlayingAudio(null);
      }
    }

    setLoadingAudio(album.id);
    let audio = audioElements.get(album.id);
    if (!audio) {
      audio = new Audio(album.audioPreviewUrl);
      audio.preload = "auto";
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));
      audio.addEventListener("error", () => {
        setLoadingAudio(null);
        setPlayingAudio(null);
      });
      audio.addEventListener("ended", () => setPlayingAudio(null));
    }

    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().then(() => {
      setPlayingAudio(album.id);
      setLoadingAudio(null);
    });
  };

  const handleAlbumClick = (album: Album) => {
    if (album.category === "Upcoming") handlePlayPreview(album);
    else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, "_blank");
    setShowPlatforms(false);
  };

  const originalAlbums = albums.filter(a => a.category === "My Music");
  const featuredAlbums = albums.filter(a => a.category === "Featured On");
  const upcomingAlbums = albums.filter(a => a.category === "Upcoming");

  const renderSectionTitle = (title: string) => (
    <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline">{title}</h2>
  );

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
            {/* My Music */}
            {originalAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "400ms" }}>
                {renderSectionTitle("My Music")}
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {originalAlbums.map((album, index) => (
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

            {/* Featured On */}
            {featuredAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "600ms" }}>
                {renderSectionTitle("Featured On")}
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

            {/* Upcoming */}
            {upcomingAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "800ms" }}>
                {renderSectionTitle("Upcoming")}
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
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                          <p className="text-gray-600 text-sm truncate">{album.artist}</p>
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
              ) : (
                <div className="w-48 h-48 bg-gray-400 flex items-center justify-center rounded-lg shadow-lg">
                  <span className="text-gray-600">No Cover</span>
                </div>
              )}
            </div>
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-gray-800 text-xl mb-2">{selectedAlbum?.title}</DialogTitle>
              <p className="text-gray-600 text-lg mb-1">{selectedAlbum?.artist}</p>
              <p className="text-gray-500 text-base">{selectedAlbum?.year}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {selectedAlbum?.links.spotify && (
                <Button onClick={() => handlePlatformClick(selectedAlbum.links.spotify!)} className="w-full bg-green-600 hover:bg-green-700 text-white p-4 h-auto">
                  <FaSpotify className="mr-3 text-xl" />
                  <span>Listen on Spotify</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
              {selectedAlbum?.links.applemusic && (
                <Button onClick={() => handlePlatformClick(selectedAlbum.links.applemusic!)} className="w-full bg-gray-800 hover:bg-gray-900 text-white p-4 h-auto">
                  <FaApple className="mr-3 text-xl" />
                  <span>Listen on Apple Music</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
              {selectedAlbum?.links.youtube && (
                <Button onClick={() => handlePlatformClick(selectedAlbum.links.youtube!)} className="w-full bg-red-600 hover:bg-red-700 text-white p-4 h-auto">
                  <FaYoutube className="mr-3 text-xl" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="ml-auto w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {!isLoading && (
          <div className="md:hidden">
            <Footer />
          </div>
        )}
      </div>
    </section>
  );
}
