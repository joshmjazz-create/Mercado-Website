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
    const fetchMusicData = async () => {
      try {
        const MY_MUSIC_DOC_ID = "1rPGjdTrPG3pqmPdstqgl95K0L8kKtJ6qPftO6yTAMxY";
        const FEATURED_ON_DOC_ID = "1JyOjg2kg3YcW6L9DGzgO99rd2WD1oQ9qwNnq2aJrTsE";
        const UPCOMING_FOLDER_ID = "1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6"; // Upcoming folder

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

  // --- Fetch albums from Google Docs ---
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
    } catch {
      return "";
    }
  };

  // --- Fetch Upcoming albums (subfolders only) ---
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
        const filesRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${subfolder.id}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`
        );
        if (!filesRes.ok) continue;
        const filesData = await filesRes.json();
        const files = filesData.files || [];
        const imageFile = files.find((f: any) => f.mimeType.startsWith("image/"));
        const audioFile = files.find((f: any) => f.mimeType.startsWith("audio/"));

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

  // --- Audio logic ---
  const handlePlayPreview = async (album: Album) => { /* same as original code */ };
  const handleAlbumClick = (album: Album) => { /* same as original code */ };
  const handlePlatformClick = (url: string) => { /* same as original code */ };

  const renderSection = (title: string, sectionAlbums: Album[]) => { /* same as original code */ };

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
            {renderSection("My Music", myMusicAlbums)}
            {renderSection("Featured On", featuredAlbums)}
            {renderSection("Upcoming", upcomingAlbums)}
          </>
        )}

        <Dialog open={showPlatforms} onOpenChange={setShowPlatforms}>
          <DialogContent className="bg-white border-purple-800">
            {/* Dialog content same as original code */}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
