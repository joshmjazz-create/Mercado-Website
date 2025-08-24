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
        console.log('Fetching biography content from public Google Doc...');
        const docContent = await fetchDocumentContent();
        console.log('Bio content loaded from public Google Docs with formatting preserved');
        setContent(docContent);
      } catch (error) {
        console.error('Bio API Error:', error);
        // Don't set any content on error - keep it empty so nothing renders
        setContent('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBioContent();
  }, []);

  const fetchDocumentContent = async (): Promise<string> => {
    try {
      console.log('Fetching public Google Doc');
      // Use the public published link
      const response = await fetch(
        'https://docs.google.com/document/d/e/2PACX-1vTApJaXwg34sAi_yd5vJA0fcdLIzyW9fcRwi9BfQ0PKzEb-8x7X1OEjlJdX7C-O-CEa0jzop997cimB/pub'
      );
      
      console.log('Public Google Docs response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Public Google Docs error:', errorText);
        throw new Error('Failed to fetch document');
      }
      
      const htmlContent = await response.text();
      console.log('HTML content received, length:', htmlContent.length);
      
      // Log a sample of the HTML to understand the structure
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const sampleContent = tempDiv.querySelector('p, div[dir="ltr"]');
      if (sampleContent) {
        console.log('Sample HTML structure:', sampleContent.outerHTML.substring(0, 500));
      }
      
      // Convert HTML to formatted text with proper paragraph breaks and italics
      return convertHtmlToFormattedText(htmlContent);
    } catch (error) {
      console.error('Error fetching document content:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const convertHtmlToFormattedText = (html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    let formattedText = '';
    
    // Find the main content area - Google Docs public view has content in specific divs
    const contentArea = tempDiv.querySelector('[id*="contents"]') || 
                       tempDiv.querySelector('.doc-content') || 
                       tempDiv.querySelector('#contents') || 
                       tempDiv;
    
    // Process each paragraph - look for more specific selectors for Google Docs
    const paragraphs = contentArea.querySelectorAll('p, .c1, .c0, div[dir="ltr"]');
    
    const processedParagraphs: string[] = [];
    
    paragraphs.forEach((p) => {
      let paragraphText = '';
      
      // Recursive function to process all nested elements
      const processNode = (node: Node): void => {
        if (node.nodeType === Node.TEXT_NODE) {
          paragraphText += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check for italics in various Google Docs formats
          const isItalic = element.tagName === 'EM' || 
                          element.tagName === 'I' || 
                          element.style.fontStyle === 'italic' ||
                          element.classList.contains('c2') || // Common Google Docs italic class
                          element.classList.contains('c3') ||
                          element.classList.contains('c4') ||
                          element.classList.contains('c5') ||
                          getComputedStyle(element).fontStyle === 'italic';
          
          if (isItalic && element.textContent?.trim()) {
            paragraphText += `*${element.textContent.trim()}*`;
          } else {
            // Process child nodes recursively
            element.childNodes.forEach(processNode);
          }
        }
      };
      
      // Process all child nodes
      p.childNodes.forEach(processNode);
      
      // Clean up and add paragraph if it has content
      paragraphText = paragraphText.trim();
      if (paragraphText && paragraphText.length > 10) { // Filter out very short content
        processedParagraphs.push(paragraphText);
      }
    });
    
    // Join paragraphs with double line breaks
    formattedText = processedParagraphs.join('\n\n');
    
    console.log('Converted HTML to formatted text:', formattedText);
    console.log('Found paragraphs:', processedParagraphs.length);
    return formattedText;
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
          {!isLoading && content && (
            <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
              <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
              <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
            </div>
          )}

          {!isLoading && content ? (
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
        {!isLoading && content && (
          <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '1500ms' }}>
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Biography</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {!isLoading && content ? (
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