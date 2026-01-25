import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailLink?: string;
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
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
          const mediaFiles: MediaItem[] = (data.files || []).map((file: any) => {
            if (file.mimeType.startsWith("image/")) {
              return { ...file, imageUrl: `https://lh3.googleusercontent.com/d/${file.id}` };
            } else if (file.mimeType.startsWith("video/")) {
              return { ...file, videoUrl: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}` };
            } else {
              return file;
            }
          });

          setPhotos(mediaFiles.filter((m) => m.imageUrl));
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

  const renderMediaSection = (title: string, media: MediaItem[], isVideo: boolean = false, delay: number = 0) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="opacity-0 translate-y-4 animate-in mb-8" style={{ animationDelay: `${delay}ms` }}>
        <h2 className="text-3xl font-semibold text-gray-400 mb-6 text-left underline">{title}</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-3 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {isVideo && item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  controls
                  className="w-full h-auto object-cover rounded-lg"
                />
              ) : item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-auto object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  onClick={() => setSelectedPhoto(item.imageUrl!)}
                  loading="lazy"
                />
              ) : null}
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

        {/* Image modal */}
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
      </div>

      {/* Footer at bottom */}
      {(!isLoading || error) && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
    </section>
  );
            }
