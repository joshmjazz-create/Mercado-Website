import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/bio", label: "Bio" },
  { path: "/gallery", label: "Gallery" },
  { path: "/music", label: "Music" },
  { path: "/schedule", label: "Schedule" },
  { path: "/contact", label: "Contact" },
  { path: "/flexlist", label: "FlexList" },
];

export default function Navigation() {
  const [location] = useHashLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-between items-center h-16">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-jazz-blue-light transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-8 w-full justify-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-4 py-2 font-medium transition-all duration-300 border-b-2 h-16 flex items-center text-base",
                  location === item.path
                    ? "text-jazz-blue-light border-jazz-blue-light"
                    : "text-white hover:text-jazz-blue-light border-transparent hover:border-jazz-blue-light"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 z-50 bg-black shadow-lg border-t border-gray-800" style={{ animation: 'slideDown 0.3s ease-out' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    location === item.path
                      ? "text-jazz-blue-light bg-gray-900"
                      : "text-white hover:text-jazz-blue-light hover:bg-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}