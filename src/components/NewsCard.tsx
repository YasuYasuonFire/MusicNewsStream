import { format } from 'date-fns';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { NewsItem } from '@/lib/llm';

interface NewsCardProps {
  item: NewsItem & { artist: string; id: string; fetchedAt?: string };
}

export function NewsCard({ item }: NewsCardProps) {
  const rawDate = item.date || item.fetchedAt || '';
  const formattedDate = (() => {
    if (!rawDate) return '';
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return rawDate;
    return format(parsed, 'yyyy-MM-dd');
  })();

  return (
    <article className="break-inside-avoid mb-4 group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
        {/* Image Section */}
        <div className="relative w-full bg-gray-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-auto object-cover block"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center text-gray-300 bg-gray-50">
              <ImageIcon className="w-12 h-12" />
            </div>
          )}
          
          {/* Overlay Category Label */}
          <div className="absolute top-2 left-2">
            <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-black/50 backdrop-blur-sm rounded-full">
              {item.category}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Header: Date & Source */}
          <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
            <span>{formattedDate}</span>
            <span className="flex items-center gap-1">
              {item.source}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-sm md:text-base font-bold text-gray-900 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-3">
            {item.title}
          </h2>

          {/* Artist Tag */}
          <div className="flex items-center mt-2">
             <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              {item.artist}
            </span>
          </div>

          {/* Summary (Show on hover or always?) - Pinterest usually hides summary or keeps it short. Let's keep it hidden or very short. */}
          <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
            {item.summary}
          </p>
        </div>
      </a>
    </article>
  );
}
