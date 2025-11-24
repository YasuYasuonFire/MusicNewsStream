export function Footer() {
  return (
    <footer className="py-12 mt-12 border-t border-gray-50">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Music News Stream. Curated by AI.
        </p>
        <p className="text-xs text-gray-300 mt-2">
          Powered by Brave Search & Gemini
        </p>
      </div>
    </footer>
  );
}

