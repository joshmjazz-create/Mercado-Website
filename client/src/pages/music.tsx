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
        const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
        const docsToFetch = [
          { id: '1rPGjdTrPG3pqmPdstqgl95K0L8kKtJ6qPftO6yTAMxY', category: 'My Music' },
          { id: '1JyOjg2kg3YcW6L9DGzgO99rd2WD1oQ9qwNnq2aJrTsE', category: 'Featured On' }
        ];

        const allAlbums: Album[] = [];

        for (const doc of docsToFetch) {
          const albumList = await fetchAlbumsFromDoc(doc.id, doc.category, API_KEY);
          allAlbums.push(...albumList);
        }

        setAlbums(allAlbums);
      } catch (error) {
        console.error('Music API Error:', error);
        console.log('Using offline mode for music');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicData();
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      scrollElement.classList.add('scrolling');

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        scrollElement.classList.remove('scrolling');
      }, 2000);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // --- NEW: Fetch all albums from a single Google Doc ---
  const fetchAlbumsFromDoc = async (docId: string, categoryName: string, apiKey: string): Promise<Album[]> => {
    try {
      const response = await fetch(
        `https://docs.google.com/document/d/${docId}/export?format=txt`
      );

      if (!response.ok) {
        console.error(`Failed to fetch document ${docId}`, response.status);
        return [];
      }

      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim());
      const albums: Album[] = [];

      let currentAlbum: any = null;

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('TITLE:')) {
          // Save previous album if exists
          if (currentAlbum) albums.push({ ...currentAlbum });
          currentAlbum = {
            id: `${docId}-${trimmedLine.replace('TITLE:', '').trim()}`,
            category: categoryName,
            links: {},
          };
          currentAlbum.title = trimmedLine.replace('TITLE:', '').trim();
        } else if (trimmedLine.startsWith('ARTIST:')) {
          currentAlbum.artist = trimmedLine.replace('ARTIST:', '').trim();
        } else if (trimmedLine.startsWith('YEAR:')) {
          currentAlbum.year = trimmedLine.replace('YEAR:', '').trim();
        } else if (trimmedLine === 'LINKS:') {
          // Will handle links in the next lines
        } else if (trimmedLine.includes(' - ') && currentAlbum) {
          const [platform, url] = trimmedLine.split(' - ');
          const key = platform.trim().toLowerCase();
          if (key === 'spotify') currentAlbum.links.spotify = url.trim();
          else if (key === 'apple music') currentAlbum.links.applemusic = url.trim();
          else if (key === 'youtube') currentAlbum.links.youtube = url.trim();
        }
      }

      // Add the last album
      if (currentAlbum) albums.push({ ...currentAlbum });

      return albums;
    } catch (error) {
      console.error('Error fetching album doc:', error);
      return [];
    }
  };

  // --- Everything else below remains exactly the same ---

  const handleAlbumClick = (album: Album) => {
    if (album.category === 'Upcoming') {
      handlePlayPreview(album);
    } else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handlePlayPreview = async (album: Album) => {
    console.log('Playing preview for album:', album.title, 'URL:', album.audioPreviewUrl);
    if (!album.audioPreviewUrl) return;

    if (playingAudio === album.id) {
      const audio = audioElements.get(album.id);
      if (audio) { audio.pause(); setPlayingAudio(null); }
      return;
    }

    if (playingAudio) {
      const currentAudio = audioElements.get(playingAudio);
      if (currentAudio) { currentAudio.pause(); setPlayingAudio(null); }
    }

    setLoadingAudio(album.id);

    let audio = audioElements.get(album.id);
    if (!audio) {
      audio = new Audio(album.audioPreviewUrl);
      audio.preload = 'auto';
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));

      audio.addEventListener('error', (e) => { console.error('Audio error:', e); setLoadingAudio(null); setPlayingAudio(null); });
      audio.addEventListener('canplaythrough', () => setLoadingAudio(null));
      audio.addEventListener('ended', () => setPlayingAudio(null));
    }

    if (audio.readyState >= 4) {
      const startTime = audio.duration / 3;
      audio.currentTime = startTime;
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
      }).catch((e) => { console.error('Audio play failed:', e); setLoadingAudio(null); setPlayingAudio(null); });
    } else {
      audio.addEventListener('canplaythrough', () => {
        const startTime = audio!.duration / 3;
        audio!.currentTime = startTime;
        audio!.volume = 0;

        audio!.play().then(() => {
          setPlayingAudio(album.id);
          setLoadingAudio(null);

          const fadeIn = setInterval(() => { if (audio!.volume < 1) audio!.volume = Math.min(1, audio!.volume + 0.05); else clearInterval(fadeIn); }, 50);
          setTimeout(() => {
            const fadeOut = setInterval(() => { if (audio!.volume > 0) audio!.volume = Math.max(0, audio!.volume - 0.05); else { clearInterval(fadeOut); audio!.pause(); setPlayingAudio(null); } }, 50);
          }, 15000);
        }).catch((e) => { console.error('Audio play failed:', e); setLoadingAudio(null); setPlayingAudio(null); });
      }, { once: true });
    }
  };

  const handlePlatformClick = (url: string) => { window.open(url, '_blank'); setShowPlatforms(false); };

  const originalAlbums = albums.filter(album => album.category === 'My Music');
  const featuredAlbums = albums.filter(album => album.category === 'Featured On');
  const upcomingAlbums = albums.filter(album => album.category === 'Upcoming');

  // --- All JSX remains unchanged ---
  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      {/* ... all your JSX for sections, album cards, modals, footer ... */}
      {/* NOTHING ELSE CHANGED */}
    </section>
  );
}
