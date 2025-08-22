import { createRoot } from "react-dom/client";
// import MinimalApp from "./App-minimal";
import App from "./App";
import "./index.css";

// Add error handling for debugging
window.addEventListener('error', (error) => {
  console.error('Global error:', error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Direct DOM manipulation fallback for immediate visibility
function renderFallbackSite() {
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; font-family: 'Libre Baskerville', serif;">
        <!-- Navigation -->
        <nav style="background: black; padding: 1rem 0; position: sticky; top: 0; z-index: 50;">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
              <a href="#home" onclick="showPage('home')" style="color: #daa520; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid #daa520;">Home</a>
              <a href="#bio" onclick="showPage('bio')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Bio</a>
              <a href="#debug" onclick="showPage('debug')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Debug</a>
              <a href="#gallery" onclick="showPage('gallery')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Gallery</a>
              <a href="#music" onclick="showPage('music')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Music</a>
              <a href="#schedule" onclick="showPage('schedule')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Schedule</a>
              <a href="#contact" onclick="showPage('contact')" style="color: white; text-decoration: none; padding: 0.5rem 1rem; border-bottom: 2px solid transparent;">Contact</a>
            </div>
          </div>
        </nav>

        <!-- Page Content -->
        <div id="page-content" style="padding: 4rem 2rem; max-width: 1200px; margin: 0 auto;">
          <!-- Home Page (Default) -->
          <div id="home-page" style="text-align: center;">
            <h1 style="font-size: 4rem; color: #8B5CF6; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">Joshua Mercado</h1>
            <p style="font-size: 1.5rem; color: #daa520; margin-bottom: 2rem;">Jazz Trumpet & Composition</p>
            <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem; margin: 2rem auto; max-width: 800px;">
              <p style="font-size: 1.1rem; line-height: 1.8;">
                Welcome to the official website of Joshua Mercado, a distinguished jazz trumpeter and composer. 
                Explore my musical journey, upcoming performances, and creative works that span traditional jazz 
                to contemporary compositions.
              </p>
            </div>
          </div>

          <!-- Debug Page -->
          <div id="debug-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #daa520; margin-bottom: 2rem;">Debug Information</h1>
            <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem; margin-bottom: 2rem;">
              <h2 style="color: #8B5CF6; margin-bottom: 1rem;">System Status</h2>
              <div style="font-family: monospace; font-size: 0.9rem; line-height: 1.8;">
                <div>✅ HTML Structure: Loaded</div>
                <div>✅ CSS Styles: Applied</div>
                <div>✅ JavaScript: Executing</div>
                <div>✅ Navigation: Functional</div>
                <div>✅ DOM Manipulation: Working</div>
                <div>❌ React Components: Failed to render</div>
              </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem;">
              <h2 style="color: #8B5CF6; margin-bottom: 1rem;">Environment Variables</h2>
              <div style="font-family: monospace; font-size: 0.9rem; line-height: 1.8;">
                <div>Current URL: ${window.location.href}</div>
                <div>User Agent: ${navigator.userAgent.substring(0, 100)}...</div>
                <div>Time: ${new Date().toISOString()}</div>
              </div>
            </div>
          </div>

          <!-- Bio Page -->
          <div id="bio-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #8B5CF6; margin-bottom: 2rem;">Biography</h1>
            <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem;">
              <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.5rem;">
                Joshua Mercado is a young but very accomplished jazz trumpeter and composer. He started playing trumpet 
                at a very young age and has been studying with various teachers.
              </p>
              <p style="font-size: 1.1rem; line-height: 1.8;">
                His musical journey encompasses both traditional jazz foundations and contemporary exploration, 
                creating a unique voice in the modern jazz landscape.
              </p>
            </div>
          </div>

          <!-- Placeholder pages -->
          <div id="gallery-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #8B5CF6; margin-bottom: 2rem;">Gallery</h1>
            <p style="text-center;">Photo gallery functionality will be restored once React components are fixed.</p>
          </div>

          <div id="music-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #8B5CF6; margin-bottom: 2rem;">Music</h1>
            <p style="text-center;">Music catalog will be restored once React components are fixed.</p>
          </div>

          <div id="schedule-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #8B5CF6; margin-bottom: 2rem;">Schedule</h1>
            <p style="text-center;">Event calendar will be restored once React components are fixed.</p>
          </div>

          <div id="contact-page" style="display: none;">
            <h1 style="font-size: 3rem; color: #8B5CF6; margin-bottom: 2rem;">Contact</h1>
            <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 1rem; text-align: center;">
              <p style="font-size: 1.1rem; margin-bottom: 1rem;">Get in touch for bookings and inquiries</p>
              <p style="color: #daa520;">joshm.jazz@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add navigation functionality
    (window as any).showPage = function(pageId: string) {
      // Hide all pages
      const pages = ['home', 'bio', 'debug', 'gallery', 'music', 'schedule', 'contact'];
      pages.forEach(page => {
        const el = document.getElementById(page + '-page');
        if (el) el.style.display = 'none';
      });
      
      // Show selected page
      const targetPage = document.getElementById(pageId + '-page');
      if (targetPage) targetPage.style.display = 'block';
      
      // Update navigation styling
      const navLinks = document.querySelectorAll('nav a');
      navLinks.forEach(link => {
        (link as HTMLElement).style.color = 'white';
        (link as HTMLElement).style.borderBottom = '2px solid transparent';
      });
      
      const activeLink = document.querySelector('nav a[href="#' + pageId + '"]');
      if (activeLink) {
        (activeLink as HTMLElement).style.color = '#daa520';
        (activeLink as HTMLElement).style.borderBottom = '2px solid #daa520';
      }
    };
  }
}

// Direct DOM rendering - bypasses all React complexity
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, forcing immediate content display");
  const root = document.getElementById("root");
  if (root) {
    renderFallbackSite();
  }
});

// Also render immediately if DOM is already loaded
if (document.readyState === 'loading') {
  // DOM still loading, wait for DOMContentLoaded
} else {
  // DOM already loaded
  console.log("DOM already loaded, rendering immediately");
  const root = document.getElementById("root");
  if (root) {
    renderFallbackSite();
  } else {
    // Fallback if root element issues
    document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    document.body.style.color = 'white';
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.padding = '40px';
    document.body.style.minHeight = '100vh';
    document.body.innerHTML = `
      <h1 style="color: #8B5CF6; font-size: 4rem; text-align: center; margin-bottom: 1rem;">Joshua Mercado</h1>
      <p style="color: #daa520; font-size: 1.5rem; text-align: center;">Jazz Trumpet & Composition</p>
      <div style="text-align: center; margin-top: 2rem;">
        <p>Professional website loading...</p>
      </div>
    `;
  }
}
