import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error handling for debugging
window.addEventListener('error', (error) => {
  console.error('Global error:', error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  createRoot(root).render(<App />);
  console.log("Full app rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  // Simple fallback that maintains your design
  document.body.innerHTML = `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 2rem; text-align: center; font-family: 'Libre Baskerville', serif;">
      <h1 style="color: #8B5CF6; font-size: 3rem; margin-bottom: 1rem;">Joshua Mercado</h1>
      <p style="color: #daa520; font-size: 1.5rem; margin-bottom: 2rem;">Jazz Trumpet & Composition</p>
      <p>Loading your professional website...</p>
      <p style="font-size: 0.9rem; color: #888; margin-top: 2rem;">Error: ${error}</p>
    </div>
  `;
}
