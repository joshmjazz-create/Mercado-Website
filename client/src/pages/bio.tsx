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
            console.log('Attempting to fetch document content for:', docFile.id);
            const docContent = await fetchDocumentContent(docFile.id);
            console.log('Bio content loaded from Google Docs with formatting preserved');
            setContent(docContent);
          } else {
            throw new Error('No documents found in Bio folder');
          }
        } else {
          const errorData = await response.json();
          console.error('Bio folder API Error Response:', errorData);
          throw new Error('Failed to access Bio folder');
        }
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

  const fetchDocumentContent = async (docId: string): Promise<string> => {
    try {
      console.log('Fetching document with ID:', docId);
      // Use the public HTML export since the document is publicly accessible
      const response = await fetch(
        `https://docs.google.com/document/d/${docId}/export?format=html`
      );
      
      console.log('Google Docs export response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Docs export error:', errorText);
        throw new Error('Failed to fetch document');
      }
      
      const htmlContent = await response.text();
      console.log('HTML content received, length:', htmlContent.length);
      
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
    
    // Process each paragraph
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach((p, index) => {
      let paragraphText = '';
      
      // Process each child node to preserve formatting
      p.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          paragraphText += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const text = element.textContent || '';
          
          // Check for italics
          if (element.tagName === 'EM' || element.tagName === 'I' || 
              element.style.fontStyle === 'italic') {
            paragraphText += `*${text}*`;
          } else {
            paragraphText += text;
          }
        }
      });
      
      // Add paragraph with proper spacing
      if (paragraphText.trim()) {
        if (index > 0) {
          formattedText += '\n\n';
        }
        formattedText += paragraphText.trim();
      }
    });
    
    console.log('Converted HTML to formatted text:', formattedText);
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