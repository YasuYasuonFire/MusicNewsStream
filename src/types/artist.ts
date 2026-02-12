export interface ArtistConfig {
  name: string;
  nameJa: string;
  aliases: string[];
  genre: string;
  disambiguation: string | null;
  mediaPages: {
    natalie?: string;
    barks?: string;
  };
  searchHints: {
    excludeTerms: string[];
  };
}
