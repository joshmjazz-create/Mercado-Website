import { Link } from "wouter";
import logoImage from "@assets/Black White Minimalist Initials Monogram Jewelry Logo_20250821_021026_0000_1755756925417.png";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src={logoImage} 
              alt="JM Music Logo" 
              className="w-12 h-12 object-contain"
            />
            <p className="text-gray-400 text-sm">
              © 2025 Joshua Mercado. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}