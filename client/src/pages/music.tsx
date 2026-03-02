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
        const MUSIC_FOLDER_ID = 'YOUR_MUSIC_FOLDER_ID'; // Music > Website > Music folder
        const API_KEY = 'YOUR_GOOGLE_API_KEY';
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${MUSIC_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.document'&key=${API_KEY}&fields=files(id,name)`
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Music API Response:', data);

          const allAlbums: Album[] = [];

          // Look for "My Music" and "Featured On" docs
          const musicDoc = data.files.find((f: any) => f.name === 'My Music');
          const featuredDoc = data.files.find((f: any) => f.name === 'Featured On');

          if (musicDoc) {
            const musicAlbums = await fetchAlbumsFromDoc(musicDoc.id, 'My Music');
            allAlbums.push(...musicAlbums);
          }

          if (featuredDoc) {
            const featuredAlbums = await fetchAlbumsFromDoc(featuredDoc.id, 'Featured On');
            allAlbums.push(...featuredAlbums);
          }

          setAlbums(allAlbums);
        } else {
          const errorData = await response.json();
          console.error('Music API Error Response:', errorData);
        }
      } catch (error) {
        console.error('Music API Error:', error);
        console.log('Using offline mode for music');
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

  // Fetch albums from a single Google Doc
  const fetchAlbumsFromDoc = async (docId: string, categoryName: string): Promise<Album[]> => {
    try {
      const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
      if (!response.ok) {
        console.error('Failed to fetch document', categoryName);
        return [];
      }

      const text = await response.text();
      console.log(`Loaded ${categoryName} doc:`, text.substring(0, 200));

      // Split by TITLE: to get each album
      const albumEntries = text.split(/\nTITLE:/).map((entry, i) => {
        if (i === 0 && !entry.trim().startsWith('TITLE')) {
          // First split may not include TITLE
          entry = 'TITLE:' + entry;
        } else {
          entry = 'TITLE:' + entry;
        }
        return entry.trim();
      }).filter(entry => entry);

      const albums: Album[] = albumEntries.map((entry, index) => {
        const lines = entry.split('\n').map(l => l.trim());
        const album: Album = {
          id: `${categoryName}-${index}`,
          title: '',
          artist: 'Joshua Mercado',
          year: new Date().getFullYear().toString(),
          category: categoryName,
          links: {}
        };

        let currentSection = '';
        for (const line of lines) {
          if (!line) continue;

          if (line.startsWith('TITLE:')) album.title = line.replace('TITLE:', '').trim();
          else if (line.startsWith('ARTIST:')) album.artist = line.replace('ARTIST:', '').trim();
          else if (line.startsWith('YEAR:')) album.year = line.replace('YEAR:', '').trim();
          else if (line === 'LINKS:') currentSection = 'links';
          else if (currentSection === 'links' && line.includes(' - ')) {
            const [platform, url] = line.split(' - ');
            const key = platform.trim().toLowerCase();
            if (key === 'spotify') album.links.spotify = url.trim();
            else if (key === 'apple music') album.links.applemusic = url.trim();
            else if (key === 'youtube') album.links.youtube = url.trim();
          }
        }

        return album;
      });

      return albums;
    } catch (error) {
      console.error('Error fetching albums from doc:', error);
      return [];
    }
  };

  // Remaining handlers (Play, Modal, UI rendering) are exactly the same
  const handleAlbumClick = (album: Album) => {
    if (album.category === 'Upcoming') {
      handlePlayPreview(album);
    } else {
      setSelectedAlbum(album);
      setShowPlatforms(true);
    }
  };

  const handlePlayPreview = async (album: Album) => {
    if (!album.audioPreviewUrl) return;

    if (playingAudio === album.id) {
      const audio = audioElements.get(album.id);
      if (audio) audio.pause();
      setPlayingAudio(null);
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
      setAudioElements(prev => new Map(prev.set(album.id, audio)));

      audio.addEventListener('error', (e) => {
        console.error('Audio error for', album.title, e);
        setLoadingAudio(null);
        setPlayingAudio(null);
      });

      audio.addEventListener('ended', () => setPlayingAudio(null));
    }

    audio.currentTime = 0;
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
          else {
            clearInterval(fadeOut);
            audio!.pause();
            setPlayingAudio(null);
          }
        }, 50);
      }, 15000);
    }).catch(() => {
      setLoadingAudio(null);
      setPlayingAudio(null);
    });
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  // Sections
  const originalAlbums = albums.filter(a => a.category === 'My Music');
  const featuredAlbums = albums.filter(a => a.category === 'Featured On');
  const upcomingAlbums = albums.filter(a => a.category === 'Upcoming');

  // Render remains identical
  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      {/* ... entire JSX from your current component remains unchanged ... */}
      {/* Only difference: albums state now comes from the two Google Docs */}
    </section>
  );
}
