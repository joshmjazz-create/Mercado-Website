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

  // ------------------- PAGE TITLE -------------------
  useEffect(() => {
    document.title = "Music";
  }, []);

  // ------------------- FETCH MUSIC DATA -------------------
  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        // Google Docs IDs for My Music and Featured On
        const MY_MUSIC_DOC_ID = "1rPGjdTrPG3pqmPdstqgl95K0L8kKtJ6qPftO6yTAMxY";
        const FEATURED_ON_DOC_ID = "1JyOjg2kg3YcW6L9DGzgO99rd2WD1oQ9qwNnq2aJrTsE";

        // Upcoming folder ID
        const UPCOMING_FOLDER_ID = "1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6";

        const myMusic = await fetchDocumentAlbums(MY_MUSIC_DOC_ID, "My Music");
        const featuredOn = await fetchDocumentAlbums(FEATURED_ON_DOC_ID, "Featured On");
        const upcoming = await fetchUpcomingAlbums(UPCOMING_FOLDER_ID);

        setAlbums([...myMusic, ...featuredOn, ...upcoming]);
      } catch (error) {
        console.error("Error loading music data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  // ------------------- SCROLL FADE EFFECT -------------------
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

  // ------------------- GOOGLE DOCS FETCH -------------------
  const fetchDocumentAlbums = async (docId: string, categoryName: string): Promise<Album[]> => {
    try {
      const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
      if (!response.ok) throw new Error(`Failed to fetch doc ${docId}`);
      const text = await response.text();
      const lines = text.split("\n").filter(line => line.trim());

      const albums: Album[] = [];
      let currentAlbum: any = {};
      let inLinks = false;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("TITLE:")) {
          if (currentAlbum.title) albums.push({ ...currentAlbum, category: categoryName });
          currentAlbum = { links: {} };
          currentAlbum.title = trimmed.replace("TITLE:", "").trim();
          inLinks = false;
        } else if (trimmed.startsWith("ARTIST:")) {
          currentAlbum.artist = trimmed.replace("ARTIST:", "").trim();
        } else if (trimmed.startsWith("YEAR:")) {
          currentAlbum.year = trimmed.replace("YEAR:", "").trim();
        } else if (trimmed === "LINKS:") {
          inLinks = true;
        } else if (inLinks && trimmed.includes(" - ")) {
          const [platform, url] = trimmed.split(" - ");
          const key = platform.trim().toLowerCase();
          if (key === "spotify") currentAlbum.links.spotify = url.trim();
          if (key === "apple music") currentAlbum.links.applemusic = url.trim();
          if (key === "youtube") currentAlbum.links.youtube = url.trim();
        }
      });

      if (currentAlbum.title) albums.push({ ...currentAlbum, category: categoryName });

      // Fetch Spotify cover art
      for (const album of albums) {
        if (album.links.spotify) {
          album.coverImageUrl = await fetchSpotifyCoverArt(album.links.spotify);
        }
      }

      return albums;
    } catch (error) {
      console.error("Error fetching document albums:", error);
      return [];
    }
  };

  const fetchSpotifyCoverArt = async (spotifyUrl: string): Promise<string> => {
    try {
      const match = spotifyUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
      if (!match) return "";
      const [, type, id] = match;
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`);
      if (!oembedRes.ok) return "";
      const data = await oembedRes.json();
      return data.thumbnail_url || "";
    } catch (error) {
      console.error("Error fetching Spotify cover art:", error);
      return "";
    }
  };

  // ------------------- UPCOMING FOLDER FETCH -------------------
  const fetchUpcomingAlbums = async (folderId: string): Promise<Album[]> => {
    try {
      const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
      );
      if (!res.ok) throw new Error("Failed to fetch upcoming folder");
      const data = await res.json();
      const upcomingAlbums: Album[] = [];
      for (const subfolder of data.files) {
        const albumFilesRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${subfolder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`
        );
        if (!albumFilesRes.ok) continue;
        const albumFilesData = await albumFilesRes.json();
        const files = albumFilesData.files || [];
        let imageFile = files.find((f: any) => f.mimeType.startsWith("image/"));
        let audioFile = files.find((f: any) => f.mimeType.startsWith("audio/"));
        upcomingAlbums.push({
          id: subfolder.id,
          title: subfolder.name,
          artist: "Joshua Mercado",
          year: new Date().getFullYear().toString(),
          category: "Upcoming",
          imageFileUrl: imageFile ? `https://lh3.googleusercontent.com/d/${imageFile.id}` : "",
          audioPreviewUrl: audioFile ? `https://www.googleapis.com/drive/v3/files/${audioFile.id}?alt=media&key=${API_KEY}` : "",
          links: {},
        });
      }
      return upcomingAlbums;
    } catch (error) {
      console.error("Error fetching upcoming albums:", error);
      return [];
    }
  };

  // ------------------- AUDIO HANDLERS -------------------
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
      audio.preload = "auto";
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));
      audio.addEventListener("ended", () => setPlayingAudio(null));
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

  const handleAlbumClick = (album: Album) => {
    if (album.category === "Upcoming") handlePlayPreview(album);
    else { setSelectedAlbum(album); setShowPlatforms(true); }
  };

  const handlePlatformClick = (url: string) => { window.open(url, "_blank"); setShowPlatforms(false); };

  // ------------------- RENDER SECTIONS -------------------
  const myMusicAlbums = albums.filter(a => a.category === "My Music");
  const featuredAlbums = albums.filter(a => a.category === "Featured On");
  const upcomingAlbums = albums.filter(a => a.category === "Upcoming");

  const renderSection = (title: string, sectionAlbums: Album[]) => {
    if (sectionAlbums.length === 0) return null;
    return (
      <div className="opacity-0 translate-y-4 animate-in mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-4 gap-4">
          {sectionAlbums.map((album, index) => (
            <div key={`${album.title}-${index}`} className="group cursor-pointer transform transition-all duration-300 hover:scale-105" onClick={() => handleAlbumClick(album)}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                <div className="aspect-square relative">
                  {album.coverImageUrl || album.imageFileUrl ? (
                    <img src={album.coverImageUrl || album.imageFileUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">No Cover</span>
                    </div>
                  )}
                  {album.category === "Upcoming" && album.audioPreviewUrl && (
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
                  <p className="text-gray-500 text-sm">{album.year}</p>
                  {album.audioPreviewUrl && album.category === "Upcoming" && <p className="text-purple-600 text-sm font-medium">Preview Available</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Music</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>}

        {!isLoading && (
          <>
            {renderSection("My Music", myMusicAlbums)}
            {renderSection("Featured On", featuredAlbums)}
            {renderSection("Upcoming", upcomingAlbums)}
          </>
        )}

        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="bg-white border-purple-800">
            {selectedAlbum?.coverImageUrl || selectedAlbum?.imageFileUrl ? (
              <img src={selectedAlbum.coverImageUrl || selectedAlbum.imageFileUrl} alt={selectedAlbum.title} className="w-48 h-48 object-cover rounded-lg shadow-lg mx-auto mb-6" />
            ) : (
              <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-lg shadow-lg mx-auto mb-6">
                <span className="text-gray-600 text-sm">No Cover</span>
              </div>
            )}
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-4 text-center">{selectedAlbum?.title}</DialogTitle>
            <p className="text-gray-600 text-center mb-4">{selectedAlbum?.artist}</p>
            <p className="text-gray-500 text-center mb-6">{selectedAlbum?.year}</p>
            <div className="grid grid-cols-1 gap-4">
              {selectedAlbum?.links.spotify && <Button onClick={() => handlePlatformClick(selectedAlbum.links.spotify)} className="w-full bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex items-center justify-center"><FaSpotify className="mr-3 text-xl" /> Listen on Spotify <ExternalLink className="ml-auto w-4 h-4" /></Button>}
              {selectedAlbum?.links.applemusic && <Button onClick={() => handlePlatformClick(selectedAlbum.links.applemusic)} className="w-full bg-gray-800 hover:bg-gray-900 text-white p-4 h-auto flex items-center justify-center"><FaApple className="mr-3 text-xl" /> Listen on Apple Music <ExternalLink className="ml-auto w-4 h-4" /></Button>}
              {selectedAlbum?.links.youtube && <Button onClick={() => handlePlatformClick(selectedAlbum.links.youtube)} className="w-full bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex items-center justify-center"><FaYoutube className="mr-3 text-xl" /> Watch on YouTube <ExternalLink className="ml-auto w-4 h-4" /></Button>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
