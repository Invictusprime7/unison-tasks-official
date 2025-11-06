# Regenerating Supabase Types After Migration

## Issue

After adding the `design_schemas` table to Supabase, TypeScript doesn't know about it yet. The `designSchemaService.ts` file temporarily bypasses type checking with `as any` until types are regenerated.

## Solution

After running the SQL migration in Supabase dashboard, regenerate the TypeScript types:

### Step 1: Login to Supabase CLI

```bash
npx supabase login
```

This will open your browser to authenticate.

### Step 2: Link Your Project

```bash
npx supabase link --project-ref oruwtgdjurstvhgqcvbv
```

### Step 3: Generate Types

```bash
npx supabase gen types typescript --project-id oruwtgdjurstvhgqcvbv > src/integrations/supabase/types.ts
```

Or using the local config:

```bash
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Step 4: Update designSchemaService.ts

After regenerating types, remove the temporary workaround:

```typescript
// Remove this:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseClient = supabase as any;

// Replace all supabaseClient with supabase:
const { data, error } = await supabase
  .from("design_schemas")
  .select("*")
  // ...
```

### Step 5: Rebuild

```bash
pnpm build
```

## Alternative: Manual Type Generation

If CLI access isn't available, you can manually add the `design_schemas` table to `src/integrations/supabase/types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables
      design_schemas: {
        Row: {
          id: string
          pattern_name: string
          pattern_type: "style" | "template"
          description: string
          keywords: string[]
          color_scheme: Json
          shadows: Json
          effects: Json
          gradients: Json
          guidelines: string[]
          tailwind_utilities: string[]
          is_active: boolean
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pattern_name: string
          pattern_type: "style" | "template"
          description?: string
          keywords?: string[]
          color_scheme?: Json
          shadows?: Json
          effects?: Json
          gradients?: Json
          guidelines?: string[]
          tailwind_utilities?: string[]
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pattern_name?: string
          pattern_type?: "style" | "template"
          description?: string
          keywords?: string[]
          color_scheme?: Json
          shadows?: Json
          effects?: Json
          gradients?: Json
          guidelines?: string[]
          tailwind_utilities?: string[]
          is_active?: boolean
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Functions: {
      // ... existing functions
      get_design_schema_by_keyword: {
        Args: {
          search_keyword: string
        }
        Returns: {
          pattern_name: string
          pattern_type: string
          description: string
          color_scheme: Json
          guidelines: string[]
        }[]
      }
    }
  }
}
```

## Current Status

✅ Migration SQL created: `supabase/migrations/20250106000000_design_schemas.sql`
✅ Service layer created: `src/services/designSchemaService.ts`
✅ AI integration completed: `src/components/creatives/AICodeAssistant.tsx`
⚠️ **Types not yet regenerated** (temporary `as any` workaround in place)
⏳ Waiting for migration to be run in Supabase dashboard

## Testing After Type Regeneration

1. Check TypeScript errors are gone:
   ```bash
   pnpm build
   ```

2. Test pattern detection:
   - Open AI Code Assistant
   - Enter: "create a neomorphic card"
   - Verify toast shows pattern detection
   - Check generated code uses neomorphic styles

3. Test CRUD operations:
   ```typescript
   // Fetch all patterns
   const schemas = await fetchDesignSchemas();
   console.log(schemas);

   // Create new pattern
   const newSchema = await upsertDesignSchema({
     pattern_name: "brutalism",
     pattern_type: "style",
     keywords: ["brutalism", "raw", "concrete", "minimal"],
     // ... other fields
   });

   // Delete pattern
   await deleteDesignSchema(schema.id);
   ```

## Benefits After Type Regeneration

- ✅ Full TypeScript autocomplete
- ✅ Type safety for database operations
- ✅ Compile-time error checking
- ✅ Better IDE support
- ✅ No more `as any` workarounds
