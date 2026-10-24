'use client';

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

interface NavLink {
  name: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "Anatomy", href: "#anatomy" },
  { name: "Hardware", href: "#hardware" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Smooth scroll helper
  const smoothScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 160;

      NAV_LINKS.forEach((link) => {
        const section = document.getElementById(link.href.substring(1));
        if (
          section &&
          scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight
        ) {
          setActiveSection(link.href.substring(1));
        }
      });

      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const displayName = user
    ? user.name || user.username || user.email.split("@")[0]
    : "";

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-3 sm:pt-4">
        {/* Floating Navbar Bar */}
        <nav
          className={`pointer-events-auto w-full rounded-full transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
            isScrolled
              ? "h-14 sm:h-16 bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
              : "h-14 sm:h-16 bg-white/70 backdrop-blur-lg border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          }`}
        >
          {/* Brand Logo */}
          <Link
            href="/"
            onClick={() => {
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setActiveSection("home");
              }
            }}
            className="flex items-center transition-transform hover:opacity-90 active:scale-95 duration-200 shrink-0"
          >
            <Logo />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1 bg-black/[0.03] px-2 py-1 rounded-full border border-black/[0.03]">
            {NAV_LINKS.map((link) => {
              const sectionId = link.href.substring(1);
              const isActive = activeSection === sectionId;

              return (
                <button
                  key={link.name}
                  onClick={() => {
                    if (isHomePage) {
                      smoothScrollTo(sectionId);
                    } else {
                      window.location.href = `/${link.href}`;
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-[#FF4F21] shadow-2xs font-bold"
                      : "text-[#636366] hover:text-[#1C1C1E] hover:bg-black/[0.02]"
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2.5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-[#1C1C1E] hover:text-[#FF4F21] rounded-full hover:bg-black/[0.03] active:scale-95 transition-all"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="px-5 py-2 text-xs font-bold bg-[#FF4F21] text-white rounded-full hover:bg-[#E03E12] active:scale-95 transition-all shadow-[0_2px_10px_rgba(255,79,33,0.25)] flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#1C1C1E] px-3 py-1.5 rounded-full bg-black/[0.03] max-w-[130px] truncate">
                  {displayName}
                </span>

                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-bold bg-[#FF4F21] text-white rounded-full hover:bg-[#E03E12] transition-all active:scale-95 shadow-[0_2px_10px_rgba(255,79,33,0.25)] flex items-center gap-1.5"
                >
                  <LayoutDashboard size={13} />
                  <span>Portal</span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/[0.04] rounded-full transition-all active:scale-95 cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="lg:hidden p-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1C1C1E] active:scale-95 transition cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#1C1C1E]" />
            ) : (
              <Menu className="w-5 h-5 text-[#1C1C1E]" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Dropdown Sheet & Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="pointer-events-auto">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
              aria-hidden="true"
            />

            {/* Clean Mobile Dropdown Island */}
            <motion.div
              initial={{ y: -16, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 inset-x-4 z-50 bg-white rounded-3xl border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.14)] p-5 lg:hidden max-h-[calc(100dvh-6rem)] overflow-y-auto"
            >
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = activeSection === link.href.substring(1);
                  return (
                    <button
                      key={link.name}
                      className={`text-sm font-semibold text-left px-3.5 py-3 rounded-2xl transition-all ${
                        isActive
                          ? "text-[#FF4F21] bg-[#FF4F21]/8 font-bold"
                          : "text-[#1C1C1E] hover:bg-black/[0.03] active:bg-black/[0.05]"
                      }`}
                      onClick={() => {
                        if (isHomePage) {
                          smoothScrollTo(link.href.substring(1));
                        } else {
                          window.location.href = `/${link.href}`;
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {link.name}
                    </button>
                  );
                })}
              </div>

              {/* Mobile CTA Strip */}
              <div className="pt-4 mt-3 border-t border-black/[0.06] space-y-2.5">
                {!user ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 border border-black/[0.1] rounded-2xl text-[#1C1C1E] font-bold text-xs flex items-center justify-center hover:bg-black/[0.03] active:scale-95 transition"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 bg-[#FF4F21] text-white rounded-2xl font-bold text-xs flex items-center justify-center shadow-[0_2px_10px_rgba(255,79,33,0.25)] hover:bg-[#E03E12] active:scale-95 transition"
                    >
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-[#F2F2F7] rounded-2xl border border-black/[0.04] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1C1E] truncate max-w-[200px]">
                        {displayName}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-wider">
                        Athlete
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex-1 py-3 bg-[#FF4F21] text-white rounded-2xl font-bold text-xs flex items-center justify-center shadow-[0_2px_10px_rgba(255,79,33,0.25)] active:scale-95 transition gap-1.5"
                      >
                        <LayoutDashboard size={14} />
                        <span>Portal Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="py-3 px-4 border border-black/[0.1] rounded-2xl text-[#8E8E93] hover:text-[#1C1C1E] font-bold text-xs flex items-center justify-center active:scale-95 transition cursor-pointer"
                        title="Sign Out"
                      >
                        <LogOut size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
