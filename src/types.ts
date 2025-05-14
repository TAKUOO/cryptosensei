export interface ExplanationData {
  url: string;
  timestamp: number;
  summary: string;
  title?: string;
  ogp?: {
    title: string;
    description: string;
    image: string;
    siteName: string;
  };
  importantPoints: {
    importance: number;
    content: string;
    explanation: string;
    analogy: string;
  }[];
  skipSections: {
    number: number;
    reason: string;
  }[];
}