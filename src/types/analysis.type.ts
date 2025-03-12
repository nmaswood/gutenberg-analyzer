export interface Character {
    name: string;
    description: string;
}

export interface Language {
    language: string;
    confidence: number;
}

export interface Genre {
    genre: string;
    confidence: number;
}

export interface Sentiment {
    sentiment: string;
    confidence: number;
}

export interface Theme {
    theme: string;
    confidence: number;
}

export interface AnalysisPayload {
    key_characters: Character[];
    language: Language[];
    genre: Genre[];
    sentiment: Sentiment[];
    plot_summary: string;
    themes: Theme[];
    notable_quotes: string[];
    notable_events: string[];
    notable_observations: string[];
}
