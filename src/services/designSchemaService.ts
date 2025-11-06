import { supabase } from "@/integrations/supabase/client";

export interface DesignSchema {
  id: string;
  pattern_name: string;
  pattern_type: "style" | "template";
  description: string;
  keywords: string[];
  color_scheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  shadows: {
    light: string;
    dark: string;
    glow: string;
  };
  effects: {
    blur: string;
    opacity: string;
    border: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  guidelines: string[];
  tailwind_utilities: string[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active design schemas from Supabase
 */
export async function fetchDesignSchemas(): Promise<DesignSchema[]> {
  const { data, error } = await supabase
    .from("design_schemas")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching design schemas:", error);
    return [];
  }

  return data as DesignSchema[];
}

/**
 * Get design schema by keyword
 */
export async function getDesignSchemaByKeyword(
  keyword: string
): Promise<DesignSchema | null> {
  const { data, error } = await supabase.rpc("get_design_schema_by_keyword", {
    search_keyword: keyword.toLowerCase(),
  });

  if (error) {
    console.error("Error getting design schema by keyword:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  return data[0] as DesignSchema;
}

/**
 * Detect design pattern from user prompt using Supabase schemas
 */
export async function detectPatternFromSupabase(
  prompt: string
): Promise<DesignSchema | null> {
  const lowerPrompt = prompt.toLowerCase();
  const schemas = await fetchDesignSchemas();

  // Find first matching schema based on keywords
  for (const schema of schemas) {
    for (const keyword of schema.keywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        return schema;
      }
    }
  }

  return null;
}

/**
 * Enhance AI prompt with design schema guidelines
 */
export function enhancePromptWithSchema(
  originalPrompt: string,
  schema: DesignSchema
): string {
  const { color_scheme, guidelines, tailwind_utilities } = schema;

  return `${originalPrompt}

## Design Pattern: ${schema.pattern_name}
${schema.description}

## Color Scheme
- Primary: ${color_scheme.primary}
- Secondary: ${color_scheme.secondary}
- Accent: ${color_scheme.accent}
- Background: ${color_scheme.background}
- Text: ${color_scheme.text}

## Guidelines
${guidelines.map((g) => `- ${g}`).join("\n")}

## Tailwind Utilities
${tailwind_utilities.join(", ")}

## CREATIVE FREEDOM
Be creative and modern. Use these guidelines as inspiration, not constraints.
Incorporate:
- Modern Tailwind CSS utilities (flex, grid, gap-*, p-*, rounded-*, shadow-*)
- Responsive design (sm:, md:, lg:, xl:)
- Hover states and transitions
- Professional spacing and typography

## IMAGE INTEGRATION
- Use semantic <img> tags with alt text
- Add loading="lazy" for performance
- Use Unsplash for placeholder images: https://images.unsplash.com/photo-...
- Apply object-fit and aspect-ratio for proper scaling
- Include srcset for responsive images when appropriate

## INDUSTRY STANDARDS
- Semantic HTML5 (header, nav, main, section, article, footer)
- BEM naming conventions for classes
- ARIA labels for accessibility
- Mobile-first responsive design
- Clean vanilla JavaScript (event listeners, no jQuery)

Be creative and modern. Don't feel constrained by rigid templates.`;
}

/**
 * Create or update a design schema in Supabase
 */
export async function upsertDesignSchema(
  schema: Partial<DesignSchema>
): Promise<DesignSchema | null> {
  const { data, error } = await supabase
    .from("design_schemas")
    .upsert(schema)
    .select()
    .single();

  if (error) {
    console.error("Error upserting design schema:", error);
    return null;
  }

  return data as DesignSchema;
}

/**
 * Delete a design schema (soft delete by setting is_active to false)
 */
export async function deleteDesignSchema(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("design_schemas")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    console.error("Error deleting design schema:", error);
    return false;
  }

  return true;
}
