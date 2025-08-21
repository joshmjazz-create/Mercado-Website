import { Link } from "wouter";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a 
              href="https://www.facebook.com/share/19eJ712nF4/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
              aria-label="Facebook"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a 
              href="https://www.instagram.com/josh.m_music?igsh=MWtlZmZlZDQ5enZtMQ==" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a 
              href="https://youtube.com/@joshm.music_?si=6rdyKqF43CHNXqDY" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors duration-300"
              aria-label="YouTube"
            >
              <FaYoutube className="w-6 h-6" />
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Joshua Mercado. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}