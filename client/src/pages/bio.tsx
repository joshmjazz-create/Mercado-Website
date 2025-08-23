import { useState, useEffect } from "react";

// Updated for GitHub Pages deployment - using relative asset paths
const bioImagePath = "./assets/Headshot_2_1755873415112.jpeg";

// Function to parse biography content with exact formatting and preserve all italics
function parseBiographyContent(content: string) {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    // Process text to preserve Google Docs formatting
    let processedText = paragraph;
    
    // Convert any markdown-style italics to HTML
    processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    processedText = processedText.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    return (
      <p 
        key={index}
        className="opacity-0 translate-y-4 animate-in" 
        style={{ animationDelay: `${600 + (index * 200)}ms` }}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  });
}

export default function Bio() {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBioContent = async () => {
      try {
        const BIO_FOLDER_ID = '1OLyT13wSRVAsUSI0rCFxwiLSQ_0MrmHz';
        const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
        
        // Get files in Bio folder
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${BIO_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.document'&key=${API_KEY}&fields=files(id,name)`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Bio API Response:', data);
          const docFile = data.files?.[0]; // Get first document
          
          if (docFile) {
            const docContent = await fetchDocumentContent(docFile.id);
            setContent(docContent);
          }
        } else {
          const errorData = await response.json();
          console.error('Bio API Error Response:', errorData);
        }
      } catch (error) {
        console.error('Bio API Error:', error);
        console.log('Using offline mode for bio');
        // Fallback to empty content - page will show loading until data is available
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioContent();
  }, []);

  const fetchDocumentContent = async (docId: string): Promise<string> => {
    try {
      const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
      const response = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}?key=${API_KEY}`
      );
      
      if (response.ok) {
        const docData = await response.json();
        const content = docData.body?.content || [];
        
        let text = '';
        content.forEach((element: any) => {
          if (element.paragraph) {
            element.paragraph.elements?.forEach((elem: any) => {
              if (elem.textRun) {
                const textContent = elem.textRun.content;
                const textStyle = elem.textRun.textStyle || {};
                
                // Preserve italics from Google Docs
                if (textStyle.italic) {
                  text += `*${textContent}*`;
                } else {
                  text += textContent;
                }
              }
            });
          }
        });
        
        return text.trim();
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
    
    return '';
  };

  return (
    <section className="min-h-screen relative">
      <style>{`
        @media (max-width: 767px) {
          section { background-color: #101010; }
        }
        @media (min-width: 768px) {
          section { background-color: hsl(220, 15%, 88%); }
        }
      `}</style>
      {/* Mobile: Background Image */}
      <div 
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat animate-[slide-in-left_0.8s_ease-out_forwards]"
        style={{ 
          backgroundImage: `url(${bioImagePath})`,
          animationDelay: '0ms'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Desktop: Content with side image */}
      <div className="hidden md:block h-full bg-jazz-grey overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : content ? (
            <div className="max-w-6xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
              <div className="flex gap-12 items-center">
                {/* Bio Content */}
                <div className="flex-1">
                  <div className="bg-jazz-grey rounded-lg shadow-lg p-8">
                    <div className="prose prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
                      {parseBiographyContent(content)}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={bioImagePath} 
                    alt="Joshua Mercado" 
                    className="w-80 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile: Content overlay */}
      <div className="md:hidden relative z-10 min-h-screen flex flex-col px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '1500ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : content ? (
            <div className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '2700ms' }}>
              <div className="bg-black bg-opacity-70 rounded-lg p-6 backdrop-blur-sm">
                <div className="prose prose-base max-w-none text-white leading-relaxed space-y-6">
                  {parseBiographyContent(content)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}