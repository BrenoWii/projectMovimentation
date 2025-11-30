export interface ExtractRow {
  date: string;
  value: number;
  description: string;
  suggestedClassificationId?: number;
  suggestedClassificationName?: string;
  confidence?: 'high' | 'medium' | 'low' | 'none';
}

export interface AnalyzeResult {
  rows: ExtractRow[];
  stats: {
    total: number;
    withSuggestion: number;
    withoutSuggestion: number;
  };
}
