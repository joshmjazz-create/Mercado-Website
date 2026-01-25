import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailLink?: string;
  width?: number;
  height?: number;
}

export default function Gallery() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch gallery media
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const FOLDER_ID = "1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";

        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink)`
        );

        if (response.ok) {
          const data = await response.json();
          const mediaFiles: MediaItem[] = await Promise.all(
            (data.files || []).map(async (file: any) => {
              if (file.mimeType.startsWith("image/")) {
                const imageUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
                const { width, height } = await getMediaDimensions(imageUrl);
                return { ...file, imageUrl, width, height };
              } else if (file.mimeType.startsWith("video/")) {
                const videoUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`;
                const { width, height } = await getVideoDimensions(videoUrl);
                const thumbnail = file.thumbnailLink || "";
                return { ...file, videoUrl, width, height, imageUrl: thumbnail };
              }
              return file;
            })
          );

          setPhotos(mediaFiles.filter((m) => m.imageUrl && m.mimeType.startsWith("image/")));
          setVideos(mediaFiles.filter((m) => m.videoUrl));
        } else {
          const errData = await response.json();
          console.error("Gallery API Error Response:", errData);
        }
      } catch (err) {
        console.error("Gallery API Error:", err);
        setError("Failed to load gallery.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Get image dimensions
  const getMediaDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 1, height: 1 });
      img.src = src;
    });
  };

  // Get video dimensions
  const getVideoDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => resolve({ width: 16, height: 9 });
      video.src = src;
    });
  };

  const renderMediaSection = (title: string, media: MediaItem[], isVideo: boolean = false, delay: number = 0) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="opacity-0 translate-y-4 animate-in mb-8" style={{ animationDelay: `${delay}ms` }}>
        <h2 className="text-3xl font-semibold text-gray-500 mb-6 text-left underline">{title}</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-3 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
              onClick={() => setSelectedMedia(item)}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={scrollRef}
      className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar"
    >
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        {/* Page header */}
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Gallery</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {/* Photos and Videos */}
        {!isLoading && !error && (
          <>
            {renderMediaSection("Pictures", photos, false, 400)}
            {renderMediaSection("Videos", videos, true, 600)}
          </>
        )}

        {/* Fullscreen modal for both images and videos */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: selectedMedia.width && selectedMedia.height
                  ? Math.min(windowWidth * 0.9, (windowWidth * 0.9) * (selectedMedia.width / selectedMedia.height))
                  : "auto",
                height: selectedMedia.height && selectedMedia.width
                  ? Math.min(window.innerHeight * 0.9, (window.innerHeight * 0.9) * (selectedMedia.height / selectedMedia.width))
                  : "auto",
              }}
            >
              {selectedMedia.videoUrl ? (
                <video
                  src={selectedMedia.videoUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg"
                />
              ) : selectedMedia.imageUrl ? (
                <img
                  src={selectedMedia.imageUrl}
                  alt={selectedMedia.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(null);
                }}
                className="absolute top-4 right-4 text-white hover:text-purple-500 text-4xl font-bold bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {(!isLoading || error) && <div className="md:hidden"><Footer /></div>}
    </section>
  );
                }
