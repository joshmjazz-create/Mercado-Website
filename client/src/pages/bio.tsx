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
        // Use the Bio folder to find Google Docs
        const BIO_FOLDER_ID = '1RH0mRswhyD0rXU2mAsrj3fGpevbcw1Th';
        const API_KEY = 'AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI';
        
        // Get Google Docs from Bio folder
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${BIO_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.document'&key=${API_KEY}&fields=files(id,name)`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('Bio folder API Response:', data);
          const docFile = data.files?.[0]; // Get first document
          
          if (docFile) {
            // Use Google Docs API to preserve formatting
            console.log('Attempting to fetch document content for:', docFile.id);
            const docContent = await fetchDocumentContent(docFile.id);
            
            if (docContent) {
              console.log('Bio content loaded from Google Docs with formatting');
              setContent(docContent);
            } else {
              console.log('Failed to load from Google Docs API, trying plain text export');
              // Fallback to plain text export
              const exportResponse = await fetch(
                `https://docs.google.com/document/d/${docFile.id}/export?format=txt`
              );
              
              if (exportResponse.ok) {
                const textContent = await exportResponse.text();
                console.log('Bio content loaded from plain text export');
                setContent(textContent);
              } else {
                console.log('Using fallback bio content');
                setContent(`Joshua Mercado is a renowned jazz musician with over two decades of experience performing across the globe. His musical journey began in his hometown, where he developed a passion for jazz that would define his career.

Throughout his career, Joshua has performed with numerous acclaimed artists and has been featured on *A Legendary Night* and *Impractical Jokers*. His unique style blends traditional jazz elements with contemporary influences, creating a sound that resonates with audiences worldwide.

Joshua continues to perform regularly and is dedicated to sharing his love of jazz with new generations of music enthusiasts.`);
              }
            }
          } else {
            console.log('No documents found in Bio folder, using fallback');
            setContent(`Joshua Mercado is a renowned jazz musician with over two decades of experience performing across the globe. His musical journey began in his hometown, where he developed a passion for jazz that would define his career.

Throughout his career, Joshua has performed with numerous acclaimed artists and has been featured on *A Legendary Night* and *Impractical Jokers*. His unique style blends traditional jazz elements with contemporary influences, creating a sound that resonates with audiences worldwide.

Joshua continues to perform regularly and is dedicated to sharing his love of jazz with new generations of music enthusiasts.`);
          }
        } else {
          const errorData = await response.json();
          console.error('Bio folder API Error Response:', errorData);
          console.log('Using fallback bio content');
          setContent(`Joshua Mercado is a renowned jazz musician with over two decades of experience performing across the globe. His musical journey began in his hometown, where he developed a passion for jazz that would define his career.

Throughout his career, Joshua has performed with numerous acclaimed artists and has been featured on *A Legendary Night* and *Impractical Jokers*. His unique style blends traditional jazz elements with contemporary influences, creating a sound that resonates with audiences worldwide.

Joshua continues to perform regularly and is dedicated to sharing his love of jazz with new generations of music enthusiasts.`);
        }
      } catch (error) {
        console.error('Bio API Error:', error);
        console.log('Using fallback bio content');
        setContent(`Joshua Mercado is a renowned jazz musician with over two decades of experience performing across the globe. His musical journey began in his hometown, where he developed a passion for jazz that would define his career.

Throughout his career, Joshua has performed with numerous acclaimed artists and has been featured on *A Legendary Night* and *Impractical Jokers*. His unique style blends traditional jazz elements with contemporary influences, creating a sound that resonates with audiences worldwide.

Joshua continues to perform regularly and is dedicated to sharing his love of jazz with new generations of music enthusiasts.`);
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
        let currentParagraph = '';
        
        content.forEach((element: any) => {
          if (element.paragraph) {
            // Start a new paragraph
            currentParagraph = '';
            
            element.paragraph.elements?.forEach((elem: any) => {
              if (elem.textRun) {
                const textContent = elem.textRun.content;
                const textStyle = elem.textRun.textStyle || {};
                
                // Preserve italics from Google Docs
                if (textStyle.italic) {
                  currentParagraph += `*${textContent.replace(/\n/g, '')}*`;
                } else {
                  currentParagraph += textContent.replace(/\n/g, '');
                }
              }
            });
            
            // Add paragraph to text with proper spacing
            if (currentParagraph.trim()) {
              if (text) {
                text += '\n\n' + currentParagraph.trim();
              } else {
                text = currentParagraph.trim();
              }
            }
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