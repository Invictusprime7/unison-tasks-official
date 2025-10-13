import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateName, aesthetic, source } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
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

    const systemPrompt = `You are an expert web designer and developer. Generate complete, production-ready HTML and CSS code based on the template request. 
    
Rules:
- Use modern HTML5 semantic elements
- ALWAYS include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the <head>
- Use embedded CSS in <style> tags for all styling
- Make it fully responsive with mobile-first approach using media queries
- Include beautiful modern design with gradients, shadows, and animations
- Use proper accessibility attributes
- Include interactive elements with CSS transitions and hover effects
- Follow the aesthetic and style requested
- Generate complete, self-contained HTML that works standalone
- Use modern CSS features like flexbox, grid, custom properties
- Include beautiful typography and spacing
- Optimize for both large and small mobile devices (320px to 1920px)
- Use relative units (rem, em, %, vw, vh) instead of fixed pixel values where appropriate`;

    const userPrompt = `Generate a complete HTML page for a "${templateName}" with ${aesthetic} aesthetic from ${source}.
    
The page should be:
- A complete HTML document with <!DOCTYPE html>, <head>, and <body>
- MUST include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in <head>
- MUST include <meta charset="UTF-8"> in <head>
- Fully styled with embedded CSS in <style> tags
- Fully functional and interactive with CSS animations
- Beautifully styled with the ${aesthetic} aesthetic
- Mobile-first responsive design with breakpoints for small (320px), medium (768px), and large (1024px+) screens
- Include sample content that demonstrates the design
- Use modern design patterns and best practices
- Include smooth transitions and hover effects
- Use semantic HTML5 elements
- Use flexible layouts that adapt to any screen size
- Optimize touch targets for mobile (minimum 44px)

Return ONLY the complete HTML code with embedded CSS, nothing else. Make it production-ready, visually stunning, and perfectly optimized for all mobile devices.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to generate template');
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        code: generatedCode,
        templateName,
        aesthetic 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-template function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});