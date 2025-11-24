import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { NewsItem } from '@/lib/llm';

interface NewsCardProps {
  item: NewsItem & { artist: string; id: string };
}

export function NewsCard({ item }: NewsCardProps) {
  return (
    <article className="group bg-white rounded-lg border border-transparent hover:border-gray-100 hover:shadow-sm transition-all duration-300 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Thumbnail (if exists) */}
        {item.imageUrl && (
          <div className="w-full md:w-48 flex-shrink-0 aspect-video md:aspect-square relative rounded-md overflow-hidden bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col space-y-3">
          {/* Meta Info */}
          <div className="flex items-center space-x-3 text-xs text-gray-400 uppercase tracking-wider font-medium">
            <span className="text-emerald-600 font-semibold">{item.artist}</span>
            <span>•</span>
            <time dateTime={item.date}>{item.date}</time>
            <span>•</span>
            <span>{item.source}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
              {item.title}
            </a>
          </h2>

          {/* Summary */}
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            {item.summary}
          </p>

          {/* Footer / Link */}
          <div className="pt-2">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-gray-400 hover:text-gray-900 transition-colors font-medium"
            >
              Read more <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
