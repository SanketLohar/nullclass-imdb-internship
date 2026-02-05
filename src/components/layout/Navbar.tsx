"use client";

import { useState } from "react";
import { Film, Search, Menu, X, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle.client";
import { useAuth } from "@/context/auth/auth.context";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/movies?search=${encodeURIComponent(searchQuery)}`
      );
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Movies", path: "/movies" },
    { label: "Top Rated", path: "/top-rated" },
    { label: "Coming Soon", path: "/coming-soon" },
    { label: "Actors", path: "/actors" },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover-glow"
          >
            <Film className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold text-glow text-foreground">
              MovieDB
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <form
              onSubmit={handleSearch}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search movies..."
                className="bg-muted text-foreground pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 w-64"
              />
            </form>

            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="text-muted-foreground hover:text-foreground transition-colors hover-glow"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/watchlist"
                className="text-muted-foreground hover:text-foreground transition-colors hover-glow"
              >
                Watchlist
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.name || user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg font-semibold transition-colors"
                  aria-label="Login"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() =>
              setIsMenuOpen((p) => !p)
            }
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <form
              onSubmit={handleSearch}
              className="relative mb-4"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search movies..."
                className="bg-muted text-foreground pl-10 pr-4 py-2 rounded-xl w-full"
              />
            </form>

            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/watchlist"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Watchlist
              </Link>
              {user ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{user.name || user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg font-semibold transition-colors w-full"
                >
                  <User className="w-4 h-4" />
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
