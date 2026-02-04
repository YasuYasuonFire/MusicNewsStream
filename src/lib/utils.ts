import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * アーティスト名をタイトルケースにフォーマット
 * 例: "mr.children" → "Mr.Children"
 */
export function formatArtistName(artist: string): string {
  return artist
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

