import { load } from "npm:cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL parameter is required" }),
        { 
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    const metadata = {
      title: $("title").text() || $('meta[property="og:title"]').attr("content") || "",
      description: $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "",
      image: $('meta[property="og:image"]').attr("content") || "",
      siteName: $('meta[property="og:site_name"]').attr("content") || "",
    };

    return new Response(
      JSON.stringify(metadata),
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