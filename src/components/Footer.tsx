import Link from 'next/link';
import { Volume2, Github, Twitter, Instagram, Music, Heart } from 'lucide-react';

const footerLinks = {
  site: [
    { label: 'ホーム', href: '/' },
    { label: 'ニュース', href: '#news' },
    { label: 'リリース', href: '#releases' },
    { label: 'ライブ', href: '#tours' },
  ],
  legal: [
    { label: 'プライバシーポリシー', href: '/privacy' },
    { label: '利用規約', href: '/terms' },
    { label: 'お問い合わせ', href: '/contact' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5">
      {/* Main Footer */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ff3c38] to-[#ff8c00] rounded flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-[var(--font-bebas-neue)] text-3xl tracking-wider text-white">
                  NOISE
                </span>
                <span className="text-[10px] tracking-[0.3em] text-[#808080] uppercase">
                  Alternative Rock News
                </span>
              </div>
            </Link>
            <p className="text-[#808080] text-sm leading-relaxed max-w-md mb-6">
              NOISEは、オルタナティブロックファンのための音楽ニュースポータルです。
              Radiohead、Arctic Monkeys、The Strokesなど、あなたの好きなアーティストの最新情報をAIがキュレーション。
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#1a1a1a] hover:bg-[#ff3c38] flex items-center justify-center text-[#808080] hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              サイト
            </h4>
            <ul className="space-y-3">
              {footerLinks.site.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#808080] hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
              その他
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#808080] hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#4a4a4a] text-xs">
              © {new Date().getFullYear()} NOISE. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-[#4a4a4a] text-xs">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-[#ff3c38] fill-current" />
              <span>for music lovers</span>
            </div>
            <div className="flex items-center gap-2 text-[#4a4a4a] text-xs">
              <Music className="w-3 h-3" />
              <span>Powered by AI Curation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
