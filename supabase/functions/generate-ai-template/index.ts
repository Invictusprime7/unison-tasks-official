import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured - AI features unavailable in local development");
      return new Response(
        JSON.stringify({ 
          error: "AI features are not available in local development. Deploy to Lovable Cloud to enable AI capabilities.",
          isLocalDevelopment: true
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert web template generator for a Web Builder canvas. Create beautiful, production-ready web page templates.

Your templates MUST use this exact schema:
{
  "name": "Template Name",
  "description": "Brief description",
  "industry": "web",
  "brandKit": {
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
    "accentColor": "#06b6d4",
    "fonts": {
      "heading": "Inter",
      "body": "Inter",
      "accent": "Inter"
    }
  },
  "sections": [
    {
      "id": "section-hero",
      "name": "Hero Section",
      "type": "hero",
      "constraints": {
        "width": { "mode": "fill" },
        "height": { "mode": "fixed", "value": 600 },
        "padding": { "top": 60, "right": 80, "bottom": 60, "left": 80 },
        "gap": 24,
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center"
      },
      "components": [
        {
          "id": "hero-title",
          "type": "text",
          "name": "Hero Title",
          "constraints": {
            "width": { "mode": "hug" },
            "height": { "mode": "hug" }
          },
          "dataBinding": {
            "field": "title",
            "type": "text",
            "defaultValue": "Welcome to Our Platform"
          },
          "style": {
            "backgroundColor": "transparent",
            "opacity": 1
          },
          "fabricProps": {
            "fontSize": 56,
            "fontFamily": "Inter",
            "fontWeight": "bold",
            "fill": "#1e293b"
          }
        },
        {
          "id": "hero-subtitle",
          "type": "text",
          "name": "Subtitle",
          "constraints": {
            "width": { "mode": "hug" },
            "height": { "mode": "hug" }
          },
          "dataBinding": {
            "field": "subtitle",
            "type": "text",
            "defaultValue": "Build amazing things with our tools"
          },
          "style": {
            "backgroundColor": "transparent",
            "opacity": 1
          },
          "fabricProps": {
            "fontSize": 24,
            "fontFamily": "Inter",
            "fill": "#64748b"
          }
        },
        {
          "id": "hero-button",
          "type": "button",
          "name": "CTA Button",
          "constraints": {
            "width": { "mode": "fixed", "value": 200 },
            "height": { "mode": "fixed", "value": 60 }
          },
          "dataBinding": {
            "field": "ctaText",
            "type": "text",
            "defaultValue": "Get Started"
          },
          "style": {
            "backgroundColor": "#3b82f6",
            "borderRadius": 8,
            "opacity": 1
          },
          "fabricProps": {
            "fontSize": 18,
            "fontFamily": "Inter",
            "fontWeight": "600",
            "fill": "#ffffff"
          }
        }
      ]
    }
  ],
  "variants": [
    {
      "id": "v1",
      "name": "Desktop",
      "size": { "width": 1280, "height": 800 },
      "format": "web"
    }
  ],
  "data": {
    "title": "Your Title Here",
    "subtitle": "Your subtitle here",
    "ctaText": "Get Started"
  }
}

CRITICAL REQUIREMENTS:
1. Create COMPLETE sections with MULTIPLE components (minimum 3-5 components per section)
2. Use component types: "text", "image", "shape", "button", "container"
3. Always include proper constraints (width/height modes: "fill", "hug", "fixed")
4. Set fabricProps for styling (fontSize, fontFamily, fill color, fontWeight)
5. Use dataBinding to make content dynamic
6. Create proper layout with padding, gap, flexDirection, alignItems, justifyContent
7. Use realistic content and professional color schemes
8. For images, use Unsplash URLs: https://images.unsplash.com/photo-{id}?w=800&q=80

EXAMPLE WEB SECTIONS TO CREATE:
- Hero: Large heading, subtitle, CTA button, optional background image
- Features: Grid of feature cards with icons, titles, descriptions
- CTA: Call-to-action section with compelling text and button
- Footer: Links, social icons, copyright text

Make templates production-ready with real content, proper spacing, and visual hierarchy!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const messageContent = data.choices[0]?.message?.content;
    
    if (!messageContent) {
      console.error("No message content from AI");
      throw new Error("No template generated");
    }

    console.log("AI Response:", messageContent.substring(0, 200) + "...");

    let templateStructure;
    try {
      templateStructure = JSON.parse(messageContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Invalid JSON response from AI");
    }

    // Validate required fields
    if (!templateStructure.sections || !Array.isArray(templateStructure.sections)) {
      console.error("Invalid template structure: missing sections");
      throw new Error("Invalid template structure: missing sections");
    }

    if (!templateStructure.variants || !Array.isArray(templateStructure.variants)) {
      console.error("Invalid template structure: missing variants");
      throw new Error("Invalid template structure: missing variants");
    }

    const completeTemplate = {
      ...templateStructure,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("✅ Template generated successfully with", 
      completeTemplate.sections.length, "sections");

    return new Response(
      JSON.stringify({ 
        template: completeTemplate,
        explanation: "AI template generated successfully with " + 
          completeTemplate.sections.length + " sections"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating AI template:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
