# Design Schemas Migration

This migration creates the `design_schemas` table to store AI design pattern definitions in Supabase.

## Instructions

1. Open the Supabase SQL Editor: https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/sql/new
2. Copy the contents of `supabase/migrations/20250106000000_design_schemas.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute the migration

## What This Migration Does

- Creates `design_schemas` table with comprehensive pattern definitions
- Enables Row Level Security (RLS) with read access for authenticated users
- Creates indexes for fast keyword lookups
- Inserts 7 default design patterns:
  - **Style Patterns**: neomorphic, cyberpunk, gradient, glassmorphism, modern
  - **Template Patterns**: material-design, creative-portfolio
- Creates `get_design_schema_by_keyword()` function for pattern detection
- Auto-updates `updated_at` timestamp on changes

## Schema Structure

```typescript
interface DesignSchema {
  id: uuid;
  pattern_name: string; // unique identifier
  pattern_type: "style" | "template";
  description: string;
  keywords: string[]; // for detection
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
  priority: number; // higher = checked first
  created_at: timestamp;
  updated_at: timestamp;
}
```

## Benefits

1. **Dynamic Updates**: Modify design patterns without redeploying code
2. **Scalability**: Add new patterns via Supabase dashboard
3. **User-Created Patterns**: Future feature to let users create custom patterns
4. **Version Control**: Track pattern changes with timestamps
5. **Performance**: Indexed keywords for fast pattern detection
6. **Flexibility**: Disable patterns without deletion using `is_active` flag

## Usage

The AI Code Assistant now checks Supabase first for pattern definitions:

```typescript
// Detect pattern from user input
const schema = await detectPatternFromSupabase("create a neomorphic card");

// Enhance prompt with Supabase schema
if (schema) {
  const enhancedPrompt = enhancePromptWithSchema(userPrompt, schema);
}
```

## Future Enhancements

- Admin UI for managing patterns
- User-created custom patterns
- Pattern analytics (usage tracking)
- Pattern versioning
- Community pattern sharing
