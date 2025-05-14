import { load } from "npm:cheerio@1.0.0-rc.12";
import { Configuration, OpenAIApi } from "npm:openai@3.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function extractArticleContent(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Remove unnecessary elements
    $('script, style, nav, footer, iframe, .advertisement').remove();

    // Get the main content
    const title = $('h1').first().text() || $('title').text();
    const content = $('article').text() || $('main').text() || $('body').text();

    return {
      title,
      content: content.trim().substring(0, 15000) // Limit content length
    };
  } catch (error) {
    console.error('Error extracting content:', error);
    throw new Error('Failed to extract article content');
  }
}

async function generateExplanation(title: string, content: string) {
  const openai = new OpenAIApi(new Configuration({
    apiKey: Deno.env.get('OPENAI_API_KEY')
  }));

  const prompt = `
以下の記事を分かりやすく解説してください。

タイトル: ${title}

記事:
${content}

以下の形式でJSON形式で出力してください:
{
  "summary": "記事の要約（200文字程度）",
  "importantPoints": [
    {
      "importance": 重要度（1-5の数値）,
      "content": "重要なポイント",
      "explanation": "詳しい説明",
      "analogy": "身近な例えで説明"
    }
  ],
  "skipSections": [
    {
      "number": セクション番号,
      "reason": "読み飛ばしてよい理由"
    }
  ]
}
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.data.choices[0].message?.content || '';
    return JSON.parse(response);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate explanation');
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      throw new Error('URL is required');
    }

    const { title, content } = await extractArticleContent(url);
    const explanation = await generateExplanation(title, content);

    return new Response(
      JSON.stringify(explanation),
      { 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});