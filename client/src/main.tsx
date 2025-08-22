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

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  createRoot(root).render(<App />);
  console.log("Full app rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  // Fallback content
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; text-align: center; background: #1a1a2e; color: white; min-height: 100vh;">
      <h1 style="color: #daa520;">Joshua Mercado</h1>
      <p>Website failed to load</p>
      <p style="color: red; font-size: 12px;">Error: ${error}</p>
      <p style="font-size: 12px;">This error fallback shows the app completely failed to initialize</p>
    </div>
  `;
}
