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
  const [upcomingAlbums, setUpcomingAlbums] = useState<Album[]>([]);
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
          const albumData = await fetchDocumentContent(doc.id);
          allAlbums.push({
            id: doc.id,
            title: albumData.title || '',
            artist: albumData.artist || 'Joshua Mercado',
            year: albumData.year || new Date().getFullYear().toString(),
            category: doc.category,
            links: albumData.links || {},
            coverImageUrl: albumData.links.spotify ? await fetchSpotifyCoverArt(albumData.links.spotify) : undefined
          });
        }

        setAlbums(allAlbums);

        // Fetch Upcoming albums using the old Drive folder/subfolder routing
        const upcomingFolderId = '1QLjaPQHjqguX1bD4UDVyN2xaPyCvvLN6'; // your existing folder ID
        const upcomingAlbumsData = await fetchAlbumsInCategory(upcomingFolderId, 'Upcoming');
        setUpcomingAlbums(upcomingAlbumsData);

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

  // --- Functions to fetch Google Docs and Drive content ---

  const fetchDocumentContent = async (docId: string): Promise<any> => {
    try {
      const response = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        const metadata: any = { title: '', artist: 'Joshua Mercado', year: new Date().getFullYear().toString(), links: {} };
        let currentSection = '';
        lines.forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('TITLE:')) metadata.title = trimmedLine.replace('TITLE:', '').trim();
          else if (trimmedLine.startsWith('ARTIST:')) metadata.artist = trimmedLine.replace('ARTIST:', '').trim();
          else if (trimmedLine.startsWith('YEAR:')) metadata.year = trimmedLine.replace('YEAR:', '').trim();
          else if (trimmedLine === 'LINKS:') currentSection = 'links';
          else if (currentSection === 'links' && trimmedLine.includes(' - ')) {
            const [platform, url] = trimmedLine.split(' - ');
            const platformKey = platform.trim().toLowerCase();
            if (platformKey === 'spotify') metadata.links.spotify = url.trim();
            else if (platformKey === 'apple music') metadata.links.applemusic = url.trim();
            else if (platformKey === 'youtube') metadata.links.youtube = url.trim();
          }
        });
        return metadata;
      } else {
        console.error('Failed to export document as text:', response.status);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
    return { title: '', artist: 'Joshua Mercado', year: new Date().getFullYear().toString(), links: {} };
  };

  const fetchSpotifyCoverArt = async (spotifyUrl: string): Promise<string> => {
    try {
      const match = spotifyUrl.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/);
      if (match) {
        const [, type, id] = match;
        const oembedResponse = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/${type}/${id}`);
        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();
          return oembedData.thumbnail_url || '';
        }
      }
    } catch (error) {
      console.error('Error fetching Spotify cover art:', error);
    }
    return '';
  };

  const fetchAlbumsInCategory = async (categoryFolderId: string, categoryName: string): Promise<Album[]> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${categoryFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name)`
      );
      if (response.ok) {
        const data = await response.json();
        const albumFolders = data.files || [];
        const albums: Album[] = [];
        for (const albumFolder of albumFolders) {
          const albumData = await fetchAlbumData(albumFolder.id, albumFolder.name, categoryName);
          if (albumData) albums.push(albumData);
        }
        return albums;
      }
    } catch (error) {
      console.error('Error fetching albums in category:', error);
    }
    return [];
  };

  const fetchAlbumData = async (albumFolderId: string, folderName: string, categoryName: string): Promise<Album | null> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const filesResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${albumFolderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink)`
      );
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const files = filesData.files || [];
        const docFile = files.find((file: any) => file.mimeType === 'application/vnd.google-apps.document');
        let albumMetadata: any = { title: folderName, artist: 'Joshua Mercado', year: new Date().getFullYear().toString(), links: {} };
        if (docFile) albumMetadata = await fetchDocumentContent(docFile.id);

        let coverImageUrl = '';
        let audioPreviewUrl = '';
        let imageFileUrl = '';

        if (categoryName === 'Upcoming') {
          const imageFile = files.find((file: any) => file.mimeType?.startsWith('image/'));
          const audioFile = files.find((file: any) => file.mimeType?.startsWith('audio/'));
          if (imageFile) imageFileUrl = `https://lh3.googleusercontent.com/d/${imageFile.id}`;
          if (audioFile) audioPreviewUrl = `https://www.googleapis.com/drive/v3/files/${audioFile.id}?alt=media&key=${API_KEY}`;
        } else if (albumMetadata.links.spotify) {
          coverImageUrl = await fetchSpotifyCoverArt(albumMetadata.links.spotify);
        }

        return {
          id: albumFolderId,
          title: albumMetadata.title || folderName,
          artist: albumMetadata.artist || 'Joshua Mercado',
          year: albumMetadata.year || new Date().getFullYear().toString(),
          category: categoryName,
          coverImageUrl,
          links: albumMetadata.links || {},
          audioPreviewUrl,
          imageFileUrl
        };
      }
    } catch (error) {
      console.error('Error fetching album data:', error);
    }
    return null;
  };

  const handleAlbumClick = (album: Album) => {
    if (album.category === 'Upcoming') handlePlayPreview(album);
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
      if (currentAudio) {
        currentAudio.pause();
        setPlayingAudio(null);
      }
    }

    setLoadingAudio(album.id);

    let audio = audioElements.get(album.id);
    if (!audio) {
      audio = new Audio(album.audioPreviewUrl);
      audio.preload = 'auto';
      setAudioElements(prev => new Map(prev.set(album.id, audio!)));

      audio.addEventListener('error', (e) => {
        console.error('Audio error for', album.title, ':', e);
        setLoadingAudio(null);
        setPlayingAudio(null);
      });
      audio.addEventListener('canplaythrough', () => setLoadingAudio(null));
      audio.addEventListener('ended', () => setPlayingAudio(null));
    }

    if (audio.readyState >= 4) {
      const startTime = audio.duration / 3;
      audio.currentTime = startTime;
      audio.volume = 0;
      audio.play().then(() => setPlayingAudio(album.id)).catch(() => setPlayingAudio(null));
    } else {
      audio.addEventListener('canplaythrough', () => {
        const startTime = audio!.duration / 3;
        audio!.currentTime = startTime;
        audio!.volume = 0;
        audio!.play().then(() => setPlayingAudio(album.id)).catch(() => setPlayingAudio(null));
      }, { once: true });
    }
  };

  const handlePlatformClick = (url: string) => {
    window.open(url, '_blank');
    setShowPlatforms(false);
  };

  const originalAlbums = albums.filter(album => album.category === 'My Music');
  const featuredAlbums = albums.filter(album => album.category === 'Featured On');

  return (
    <section ref={scrollRef} className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar">
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
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
            {originalAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '400ms' }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">My Music</h2>
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

            {/* Featured On Section */}
            {featuredAlbums.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '600ms' }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">Featured On</h2>
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
              <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: '800ms' }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-8 text-left underline decoration-gray-700">Upcoming</h2>
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

      </div>

      {!isLoading && <div className="md:hidden"><Footer /></div>}
    </section>
  );
}
