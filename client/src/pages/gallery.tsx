import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

export default function Gallery() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const scrollRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [pictures, setPictures] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Gallery";
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Load media from Google Drive
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const FOLDER_ID = "1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";

        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType)`
        );

        if (response.ok) {
          const data = await response.json();
          const mediaItems = data.files || [];

          const pics = mediaItems
            .filter((f: any) => f.mimeType.startsWith("image/"))
            .map((f: any) => ({
              ...f,
              imageUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
            }));

          const vids = mediaItems
            .filter((f: any) => f.mimeType.startsWith("video/"))
            .map((f: any) => ({
              ...f,
              videoUrl: `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`,
            }));

          setPictures(pics);
          setVideos(vids);
        } else {
          const errorData = await response.json();
          console.error("Gallery API Error:", errorData);
          setError("Failed to load media");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load media");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const renderMediaSection = (title: string, items: any[], isVideo = false) => {
    if (!items.length) return null;

    return (
      <div className="opacity-0 translate-y-4 animate-in mb-12" style={{ animationDelay: "400ms" }}>
        <h2 className="text-gray-500 text-lg mb-4 font-semibold underline">{title}</h2>
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-3 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
              onClick={() => setSelectedMedia(isVideo ? item.videoUrl : item.imageUrl)}
            >
              {isVideo ? (
                <div className="relative aspect-video bg-black">
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                </div>
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Gallery</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        {!isLoading && renderMediaSection("Pictures", pictures)}
        {!isLoading && renderMediaSection("Video", videos, true)}

        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setSelectedMedia(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {selectedMedia?.endsWith(".mp4") ? (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg"
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Selected Media"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(null);
                }}
                className="absolute top-8 right-8 text-white hover:text-purple-500 text-4xl font-bold bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {(!isLoading || error) && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
    </section>
  );
}
