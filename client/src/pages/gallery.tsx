import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  imageUrl?: string;
  videoUrl?: string;
  width?: number;
  height?: number;
  orientation?: string;
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Gallery";
  }, []);

  // Window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom scrollbar fade
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

  // Fetch media from Google Drive
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const GALLERY_FOLDER_ID = "1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${GALLERY_FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`
        );

        if (!response.ok) throw new Error("Failed to fetch gallery");

        const data = await response.json();
        const items: MediaItem[] = await Promise.all(
          (data.files || []).map(async (file: any) => {
            const isImage = file.mimeType.startsWith("image/");
            const isVideo = file.mimeType.startsWith("video/");
            const url = isImage
              ? `https://lh3.googleusercontent.com/d/${file.id}`
              : isVideo
              ? file.webViewLink // We'll use the link from the Google Doc / YouTube
              : undefined;

            let width = 0,
              height = 0,
              orientation = "square";

            if (isImage && url) {
              const dims = await getImageDimensions(url);
              width = dims.width;
              height = dims.height;
              orientation = dims.orientation;
            }

            return {
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              imageUrl: isImage ? url : undefined,
              videoUrl: isVideo ? url : undefined,
              width,
              height,
              orientation,
            };
          })
        );

        setPhotos(items.filter((i) => i.imageUrl));
        setVideos(items.filter((i) => i.videoUrl));
      } catch (err) {
        console.error(err);
        setError("Error loading gallery");
      } finally {
        setIsLoadingPhotos(false); // page loads once photos are ready
      }
    };

    fetchMedia();
  }, []);

  const getImageDimensions = (
    src: string
  ): Promise<{ width: number; height: number; orientation: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const orientation =
          aspectRatio > 1.2 ? "horizontal" : aspectRatio < 0.8 ? "vertical" : "square";
        resolve({ width: img.width, height: img.height, orientation });
      };
      img.onerror = () => resolve({ width: 1, height: 1, orientation: "square" });
      img.src = src;
    });
  };

  // Extract YouTube video ID
  const extractYouTubeID = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    return match ? match[1] : "";
  };

  return (
    <section
      ref={scrollRef}
      className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar"
    >
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Gallery</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoadingPhotos && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {!isLoadingPhotos && photos.length > 0 && (
          <>
            {/* Pictures Section */}
            <div className="opacity-0 translate-y-4 animate-in mb-8" style={{ animationDelay: "400ms" }}>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4 underline">
                Pictures
              </h2>
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid mb-3 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
                    onClick={() => setSelectedPhoto(photo.imageUrl!)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.name}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Videos Section */}
            {videos.length > 0 && (
              <div className="opacity-0 translate-y-4 animate-in mb-8" style={{ animationDelay: "600ms" }}>
                <h2 className="text-2xl font-semibold text-gray-600 mb-4 underline">Videos</h2>
                <div className="flex flex-col gap-6">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="relative w-full aspect-video bg-black">
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeID(video.videoUrl!)}/hqdefault.jpg`}
                          alt={video.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Text overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-3">
                          <p className="text-white font-semibold text-lg">{video.name}</p>
                        </div>
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black bg-opacity-50 p-3 rounded-full text-white text-2xl">
                            ▶
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Selected photo modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <img
                src={selectedPhoto}
                alt="Gallery photo"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto(null);
                }}
                className="absolute top-8 right-8 text-white hover:text-purple-500 text-4xl font-bold bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen video modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
            onClick={() => setSelectedVideo(null)}
          >
            <div className="relative w-full max-w-6xl h-auto">
              <iframe
                src={selectedVideo.videoUrl}
                className="w-full aspect-video"
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 text-white hover:text-purple-500 text-4xl font-bold bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(!isLoadingPhotos || error) && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
    </section>
  );
}
