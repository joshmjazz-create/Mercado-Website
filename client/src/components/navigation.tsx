import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/bio", label: "Bio" },
  { path: "/gallery", label: "Gallery" },
  { path: "/music", label: "Music" },
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
          {/* Navigation Tabs - Visible on all screens except mobile */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-2 py-2 font-medium transition-all duration-300 border-b-2 h-16 flex items-center text-sm md:text-base md:px-4",
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
      </div>
      

    </nav>
  );
}