import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Article {
  id: string;
  url: string;
  created_at: string;
}

export interface Explanation {
  id: string;
  article_id: string;
  summary: string;
  created_at: string;
  title?: string;
  ogp?: {
    title: string;
    description: string;
    image: string;
    siteName: string;
  };
}

export interface ImportantPoint {
  id: string;
  explanation_id: string;
  importance: number;
  content: string;
  explanation: string;
  analogy: string;
}

export interface SkipSection {
  id: string;
  explanation_id: string;
  number: number;
  reason: string;
}

export async function fetchMetadata(url: string) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/fetch-metadata?url=${encodeURIComponent(url)}`,
    {
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch metadata');
  }
  
  return response.json();
}

export async function generateExplanation(url: string) {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/explain-article`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ url })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to generate explanation');
  }

  return response.json();
}

export async function saveExplanation(url: string): Promise<ExplanationData> {
  // First check if the article already exists
  const { data: existingArticle, error: articleError } = await supabase
    .from('articles')
    .select('id')
    .eq('url', url)
    .single();

  let articleId: string;

  if (existingArticle) {
    // Use existing article ID
    articleId = existingArticle.id;
  } else {
    // Create new article if it doesn't exist
    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({ url })
      .select()
      .single();

    if (insertError) throw insertError;
    articleId = newArticle.id;
  }

  // Check if explanation exists for this article
  const { data: existingExplanations, error: explanationError } = await supabase
    .from('explanations')
    .select(`
      id,
      summary,
      created_at,
      title,
      ogp,
      important_points (
        importance,
        content,
        explanation,
        analogy
      ),
      skip_sections (
        number,
        reason
      )
    `)
    .eq('article_id', articleId)
    .limit(1);

  // If explanation exists, return it
  if (existingExplanations && existingExplanations.length > 0) {
    const existingExplanation = existingExplanations[0];
    return {
      url,
      timestamp: new Date(existingExplanation.created_at).getTime(),
      summary: existingExplanation.summary,
      title: existingExplanation.title,
      ogp: existingExplanation.ogp,
      importantPoints: existingExplanation.important_points,
      skipSections: existingExplanation.skip_sections
    };
  }

  // Generate new explanation if none exists
  const [metadata, explanation] = await Promise.all([
    fetchMetadata(url),
    generateExplanation(url)
  ]);

  // Get the current user's ID
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated');

  // Create new explanation
  const { data: exp, error: insertError } = await supabase
    .from('explanations')
    .insert({
      article_id: articleId,
      user_id: user.id, // Add the user_id
      summary: explanation.summary,
      title: metadata.title,
      ogp: metadata
    })
    .select()
    .single();

  if (insertError) throw insertError;

  // Insert important points and skip sections
  const importantPointsPromise = supabase
    .from('important_points')
    .insert(
      explanation.importantPoints.map(point => ({
        explanation_id: exp.id,
        ...point
      }))
    );

  const skipSectionsPromise = supabase
    .from('skip_sections')
    .insert(
      explanation.skipSections.map(section => ({
        explanation_id: exp.id,
        ...section
      }))
    );

  await Promise.all([importantPointsPromise, skipSectionsPromise]);

  return {
    url,
    timestamp: new Date(exp.created_at).getTime(),
    summary: explanation.summary,
    title: metadata.title,
    ogp: metadata,
    importantPoints: explanation.importantPoints,
    skipSections: explanation.skipSections
  };
}

export async function getExplanationHistory(): Promise<ExplanationData[]> {
  const { data: explanations, error: explanationsError } = await supabase
    .from('explanations')
    .select(`
      id,
      summary,
      created_at,
      title,
      ogp,
      articles!inner(url),
      important_points(
        importance,
        content,
        explanation,
        analogy
      ),
      skip_sections(
        number,
        reason
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  if (explanationsError) throw explanationsError;

  return explanations.map(exp => ({
    url: exp.articles.url,
    timestamp: new Date(exp.created_at).getTime(),
    summary: exp.summary,
    title: exp.title,
    ogp: exp.ogp,
    importantPoints: exp.important_points,
    skipSections: exp.skip_sections
  }));
}