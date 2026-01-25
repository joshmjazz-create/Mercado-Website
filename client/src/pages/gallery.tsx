import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

interface MediaItem {
  id?: string;
  name: string;
  mimeType?: string;
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Fetch photos from Google Drive
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const PHOTOS_FOLDER_ID = "1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${PHOTOS_FOLDER_ID}'+in+parents+and+mimeType+contains+'image'&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`
        );

        if (!response.ok) throw new Error("Failed to fetch gallery photos");

        const data = await response.json();
        const photosWithDimensions: MediaItem[] = await Promise.all(
          (data.files || []).map(async (file: any) => {
            const imageUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
            const dims = await getImageDimensions(imageUrl);
            return {
              id: file.id,
              name: file.name,
              mimeType: file.mimeType,
              imageUrl,
              width: dims.width,
              height: dims.height,
              orientation: dims.orientation,
            };
          })
        );

        setPhotos(photosWithDimensions);
      } catch (err) {
        console.error(err);
        setError("Error loading photos");
      } finally {
        setIsLoadingPhotos(false); // page loads once photos are ready
      }
    };

    fetchPhotos();
  }, []);

  // Fetch videos from Google Doc
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const docUrl =
          "https://docs.google.com/document/d/1OgBLENlcU01O-yCxUfLJYixA6ijgT3t58HROwqpMVG8/export?format=txt";
        const response = await fetch(docUrl);
        if (!response.ok) throw new Error("Failed to fetch video doc");
        const text = await response.text();

        const lines = text.split("\n").map((l) => l.trim());
        const videoItems: MediaItem[] = [];

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith("TITLE:")) {
            const title = lines[i].replace("TITLE:", "").trim();
            let link = "";
            // look ahead for LINK:
            if (i + 1 < lines.length && lines[i + 1].startsWith("LINK:")) {
              link = lines[i + 1].replace("LINK:", "").trim();
              i++; // skip next line since it’s consumed
            }
            if (title && link) {
              videoItems.push({
                name: title,
                videoUrl: link,
              });
            }
          }
        }

        setVideos(videoItems);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideos();
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

  return (
    <section
      ref={scrollRef}
      className="min-h-screen desktop-container bg-jazz-grey md:overflow-y-auto custom-scrollbar"
    >
      <div className="container mx-auto px-4 py-8 pb-16 md:pb-80">
        <div
          className="text-center mb-8 opacity-0 translate-y-4 animate-in"
          style={{ animationDelay: "200ms" }}
        >
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
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4 underline">
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
          </>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="opacity-0 translate-y-4 animate-in mb-8" style={{ animationDelay: "600ms" }}>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4 underline">
              Videos
            </h2>
            <div className="flex flex-col gap-6">
              {videos.map((video, idx) => (
                <div
                  key={idx}
                  className="cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                    <img
                      src={`https://img.youtube.com/vi/${extractYouTubeID(video.videoUrl!)}/hqdefault.jpg`}
                      alt={video.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white p-2 font-semibold text-lg">
                      {video.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                className="w-full aspect-video"
                src={selectedVideo.videoUrl!.replace("watch?v=", "embed/")}
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

// Helper to extract YouTube ID for thumbnails
function extractYouTubeID(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}
