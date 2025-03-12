export type bookMetadata = {
  [key: string]: string | undefined | number | [];
  title?: string;
  author?: string;
  language?: string;
  category?: string;
  notes?: [];
  subjects?: [];
  readingEase?: number;
  copyrightStatus?: string;
  mostRecentlyUpdated?: string;
  locClass?: string;
  releaseDate?: string;
  downloads?: number;
  coverPhotoUrl?: string;
}