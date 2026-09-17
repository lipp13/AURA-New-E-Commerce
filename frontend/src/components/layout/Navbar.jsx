import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Scale,
  LogOut,
  ChevronDown
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";
import { useAuth } from "../../context/AuthContext";
import { SearchModal } from "../modals/SearchModal";

export const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const { totalItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { currentUser, isAuthenticated, openAuthModal, logout } = useAuth();

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Belanja", path: "/shop" },
    { name: "Tentang", path: "/about" },
    { name: "Kontak", path: "/contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#F5F1E8]/95 backdrop-blur-md border-b border-[#D8D2C6]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Brand Wordmark */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-baseline gap-2 shrink-0 group">
                <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tighter text-[#171717] group-hover:text-[#F4512A] transition-colors">
                  AURA
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#6B675F]">
                  / OBJEK
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-8 ml-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`text-xs uppercase tracking-widest transition-colors py-1 relative ${
                        isActive
                          ? "text-[#171717] font-bold"
                          : "text-[#6B675F] hover:text-[#171717]"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <div className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#F4512A]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Utility Actions */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Search Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 sm:p-0 text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors flex items-center gap-1.5"
                aria-label="Cari katalog objek"
              >
                <Search className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>

              {/* Compare Trigger */}
              <Link
                to="/compare"
                className="hidden lg:flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors"
                aria-label="Bandingkan objek"
              >
                <span>Bandingkan</span>
                {compareList.length > 0 && (
                  <span className="font-mono text-[10px] text-[#F4512A] font-bold">
                    [{compareList.length}]
                  </span>
                )}
              </Link>

              {/* Wishlist Trigger */}
              <Link
                to="/wishlist"
                className="hidden sm:flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors"
                aria-label="Objek tersimpan"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="font-mono text-[10px] text-[#F4512A] font-bold">
                    [{wishlist.length}]
                  </span>
                )}
              </Link>

              {/* Cart / Bag Trigger */}
              <Link
                to="/cart"
                className="p-2 sm:p-0 flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors"
                aria-label="Keranjang belanja"
              >
                <div className="relative flex items-center">
                  <ShoppingBag className="w-5 h-5 sm:w-4 sm:h-4" />
                  {totalItemsCount > 0 && (
                    <span className="sm:hidden absolute -top-1.5 -right-2 bg-[#F4512A] text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Keranjang</span>
                <span className={`hidden sm:inline font-mono text-xs font-bold ${totalItemsCount > 0 ? 'text-[#F4512A]' : 'text-[#6B675F]'}`}>
                  [{totalItemsCount}]
                </span>
              </Link>

              {/* Account Dropdown or Login */}
              {isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors py-1"
                  >
                    <span className="font-bold">{currentUser?.name?.split(' ')[0] || 'Akun'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B675F]" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        onMouseLeave={() => setIsUserMenuOpen(false)}
                        className="absolute right-0 mt-3 w-60 bg-[#FAF8F2] border border-[#D8D2C6] p-4 z-50 space-y-3 shadow-xl"
                      >
                        <div className="border-b border-[#D8D2C6] pb-3">
                          <p className="text-xs font-bold text-[#171717] uppercase tracking-wider truncate">
                            {currentUser?.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#6B675F] truncate">
                            {currentUser?.email}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between text-xs uppercase tracking-wider text-[#171717] hover:text-[#F4512A] transition-colors"
                          >
                            <span>Dasbor &amp; Pesanan</span>
                            <span className="text-[#6B675F]">→</span>
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center justify-between text-xs uppercase tracking-wider text-[#171717] hover:text-[#F4512A] transition-colors"
                          >
                            <span>Objek Disimpan</span>
                            <span className="font-mono text-[#6B675F]">({wishlist.length})</span>
                          </Link>
                        </div>

                        <div className="border-t border-[#D8D2C6] pt-3">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-rose-700 hover:text-rose-900 transition-colors text-left"
                          >
                            <span>Keluar</span>
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-xs uppercase tracking-widest text-[#171717] hover:text-[#F4512A] transition-colors font-semibold"
                  >
                    Masuk
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-[#171717] hover:text-[#F4512A] transition-colors md:hidden focus:outline-none"
                aria-label="Menu navigasi"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#D8D2C6] bg-[#F5F1E8] px-6 py-8 max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <div className="space-y-6">
                <nav className="space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-xl font-display font-bold uppercase tracking-tight text-[#171717] hover:text-[#F4512A]"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between text-xl font-display font-bold uppercase tracking-tight text-[#171717] hover:text-[#F4512A]"
                  >
                    <span>Keranjang Belanja</span>
                    <span className="font-mono text-sm font-normal">[{totalItemsCount}]</span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between text-xl font-display font-bold uppercase tracking-tight text-[#171717] hover:text-[#F4512A]"
                  >
                    <span>Objek Disimpan</span>
                    <span className="font-mono text-sm font-normal">[{wishlist.length}]</span>
                  </Link>
                  <Link
                    to="/compare"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between text-xl font-display font-bold uppercase tracking-tight text-[#171717] hover:text-[#F4512A]"
                  >
                    <span>Bandingkan</span>
                    <span className="font-mono text-sm font-normal">[{compareList.length}]</span>
                  </Link>
                </nav>

                <div className="border-t border-[#D8D2C6] pt-6">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xs uppercase tracking-widest font-bold text-[#171717]"
                      >
                        Dasbor Akun ({currentUser?.name})
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="text-xs uppercase tracking-widest text-rose-700 hover:underline"
                      >
                        Keluar
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openAuthModal('login');
                        }}
                        className="text-xs uppercase tracking-widest font-bold text-[#171717] hover:text-[#F4512A]"
                      >
                        Masuk ke Akun →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};
