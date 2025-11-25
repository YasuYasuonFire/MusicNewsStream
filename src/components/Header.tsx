'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Volume2 } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'ホーム' },
  { href: '#news', label: 'ニュース' },
  { href: '#releases', label: 'リリース' },
  { href: '#tours', label: 'ライブ' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative">
              {/* Animated Sound Wave Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff3c38] to-[#ff8c00] rounded flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#ff3c38] to-[#ff8c00] rounded opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span 
                className="glitch font-[var(--font-bebas-neue)] text-2xl md:text-3xl tracking-wider text-white leading-none"
                data-text="NOISE"
              >
                NOISE
              </span>
              <span className="text-[10px] tracking-[0.3em] text-[#808080] uppercase hidden sm:block">
                Alternative Rock
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="link-underline text-sm font-medium text-[#e0e0e0] hover:text-white transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button 
              className="p-2 text-[#808080] hover:text-white transition-colors"
              aria-label="検索"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Subscribe Button - Desktop */}
            <Link
              href="#subscribe"
              className="hidden md:block btn-primary text-xs py-2 px-4"
            >
              購読する
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#808080] hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="メニュー"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-20 bg-[#0a0a0a]/98 backdrop-blur-lg transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <nav className="container mx-auto px-6 py-8 flex flex-col gap-6">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl font-bold text-white hover:text-[#ff3c38] transition-colors uppercase tracking-wider animate-slideInLeft stagger-item`}
              style={{ animationDelay: `${index * 0.1}s`, opacity: isMobileMenuOpen ? 1 : 0 }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-6 border-t border-white/10">
            <Link
              href="#subscribe"
              className="btn-primary inline-block text-center w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              購読する
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
