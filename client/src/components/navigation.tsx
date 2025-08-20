import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/bio", label: "Bio" },
  { path: "/gallery", label: "Gallery" },
  { path: "/schedule", label: "Schedule" },
  { path: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 w-full">
          {/* Navigation Tabs - Always visible on larger screens */}
          <div className="hidden sm:flex">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "px-3 py-2 font-medium transition-all duration-300 border-b-2 h-16 flex items-center text-sm lg:text-base lg:px-4",
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
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-jazz-green focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-jazz-dark">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 font-medium transition-colors duration-300",
                  location === item.path
                    ? "text-jazz-blue-light"
                    : "text-white hover:text-jazz-blue-light"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}