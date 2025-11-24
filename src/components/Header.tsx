import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-100 py-8 mb-12">
      <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          <Link href="/" className="hover:opacity-70 transition-opacity">
            Music News Stream
          </Link>
        </h1>
        <nav>
          <Link 
            href="https://github.com/yasuyasu/MusicNewsStream" 
            target="_blank" 
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </header>
  );
}

