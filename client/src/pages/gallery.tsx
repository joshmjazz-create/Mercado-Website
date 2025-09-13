import { useState, useEffect, useRef } from "react";
import Footer from "@/components/footer";

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const scrollRef = useRef<HTMLElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update document title
  useEffect(() => {
    document.title = "Gallery";
  }, []);

  // Handle window resize for responsive sizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle custom scrollbar fade effect
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

  // Load photos from Google Drive API
  const [photos, setPhotos] = useState<any[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const PHOTOS_FOLDER_ID = "1ORtM5yFEzaCN5B_Sx3ErmDH5qTDCRXGd";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${PHOTOS_FOLDER_ID}'+in+parents+and+mimeType+contains+'image'&key=${API_KEY}&fields=files(id,name,mimeType,webViewLink,thumbnailLink)`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Gallery API Response:", data);
          const photosWithDimensions = await Promise.all(
            (data.files || []).map(async (photo: any) => {
              const imageUrl = `https://lh3.googleusercontent.com/d/${photo.id}`;
              const dimensions = await getImageDimensions(imageUrl);
              return { ...photo, imageUrl, ...dimensions };
            })
          );
          setPhotos(photosWithDimensions);
          setProcessedPhotos(organizePhotosForLayout(photosWithDimensions));
        } else {
          const errorData = await response.json();
          console.error("Gallery API Error Response:", errorData);
        }
      } catch (error) {
        console.error("Gallery API Error:", error);
        console.log("Using offline mode for gallery");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
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

  const organizePhotosForLayout = (photos: any[]) => {
    const horizontal = photos.filter((p) => p.orientation === "horizontal");
    const vertical = photos.filter((p) => p.orientation === "vertical");
    const square = photos.filter((p) => p.orientation === "square");

    const organized = [];
    let hIndex = 0,
      vIndex = 0,
      sIndex = 0;

    while (hIndex < horizontal.length || vIndex < vertical.length || sIndex < square.length) {
      if (hIndex < horizontal.length - 1 && vIndex < vertical.length) {
        organized.push({
          type: "group",
          items: [
            { ...horizontal[hIndex], position: "top-left" },
            { ...horizontal[hIndex + 1], position: "bottom-left" },
            { ...vertical[vIndex], position: "right" }
          ]
        });
        hIndex += 2;
        vIndex += 1;
      } else if (sIndex < square.length - 1) {
        organized.push({
          type: "group",
          items: [
            { ...square[sIndex], position: "left" },
            { ...square[sIndex + 1], position: "right" }
          ]
        });
        sIndex += 2;
      } else {
        if (hIndex < horizontal.length) {
          organized.push({ type: "single", item: horizontal[hIndex] });
          hIndex++;
        } else if (vIndex < vertical.length) {
          organized.push({ type: "single", item: vertical[vIndex] });
          vIndex++;
        } else if (sIndex < square.length) {
          organized.push({ type: "single", item: square[sIndex] });
          sIndex++;
        }
      }
    }

    return organized;
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
            <p className="text-red-600 text-lg">Error loading photos</p>
          </div>
        )}

        {!isLoading && photos.length === 0 && <div></div>}

        {!isLoading && photos.length > 0 && (
          <div
            className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "400ms" }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid mb-3 cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
                onClick={() => setSelectedPhoto(photo.imageUrl)}
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
        )}

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

      {(!isLoading || error) && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
    </section>
  );
}
