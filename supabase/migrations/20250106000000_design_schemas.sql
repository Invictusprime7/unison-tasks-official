-- Create design_schemas table to store AI design pattern schemas
-- This allows dynamic schema updates without code deployment

create table if not exists public.design_schemas (
  id uuid default gen_random_uuid() primary key,
  pattern_name text not null unique,
  pattern_type text not null, -- 'style' or 'template'
  description text,
  keywords text[] not null default '{}',
  color_scheme jsonb not null default '{}'::jsonb,
  shadows jsonb not null default '{}'::jsonb,
  effects jsonb not null default '{}'::jsonb,
  gradients jsonb not null default '{}'::jsonb,
  guidelines text[] not null default '{}',
  tailwind_utilities text[] not null default '{}',
  is_active boolean not null default true,
  priority integer not null default 0, -- Higher priority patterns checked first
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.design_schemas enable row level security;

-- Allow public read access for AI to fetch schemas
create policy "Anyone can view active design schemas"
  on public.design_schemas for select
  using (is_active = true);

-- Only authenticated users can manage schemas (for admin purposes)
create policy "Authenticated users can manage design schemas"
  on public.design_schemas for all
  using (auth.role() = 'authenticated');

-- Create index for fast keyword lookups
create index design_schemas_keywords_idx on public.design_schemas using gin(keywords);
create index design_schemas_pattern_type_idx on public.design_schemas(pattern_type);
create index design_schemas_priority_idx on public.design_schemas(priority desc);

-- Insert default design schemas
insert into public.design_schemas (
  pattern_name, 
  pattern_type, 
  description, 
  keywords, 
  color_scheme, 
  shadows, 
  effects, 
  gradients,
  guidelines,
  tailwind_utilities,
  priority
) values
-- Style Patterns
(
  'neomorphic',
  'style',
  'Soft UI with tactile shadows and embossed effects',
  ARRAY['neomorphic', 'neomorphism', 'neumorphic', 'soft ui', 'soft shadow', 'embossed', 'raised', 'inset', 'tactile'],
  '{"primary": "#e0e5ec", "secondary": "#d1d9e6", "accent": "#a0b0c5", "background": "#e0e5ec", "surface": "#e0e5ec", "text": "#4a5568", "textSecondary": "#718096"}'::jsonb,
  '{"light": "8px 8px 16px #b8bec7, -8px -8px 16px #ffffff", "dark": "inset 8px 8px 16px #b8bec7, inset -8px -8px 16px #ffffff", "glow": "0 0 20px rgba(160, 176, 197, 0.3)"}'::jsonb,
  '{"blur": "0px", "opacity": "1", "border": "1px solid rgba(255, 255, 255, 0.1)"}'::jsonb,
  '{"primary": "linear-gradient(145deg, #e6ebf1, #c9d1db)", "secondary": "linear-gradient(145deg, #d1d9e6, #b8c0cd)", "accent": "linear-gradient(145deg, #a0b0c5, #8a9ab0)"}'::jsonb,
  ARRAY['Use subtle, soft shadows', 'Create raised and inset effects', 'Monochromatic color schemes', 'Elements appear to extrude from background'],
  ARRAY['shadow-inner', 'shadow-lg', 'rounded-2xl', 'bg-gray-200'],
  100
),
(
  'cyberpunk',
  'style',
  'Neon futuristic design with electric glow effects',
  ARRAY['cyberpunk', 'neon', 'futuristic', 'cyber', 'sci-fi', 'matrix', 'tech', 'glow', 'electric', 'digital', 'holographic'],
  '{"primary": "#00ffff", "secondary": "#ff00ff", "accent": "#ffff00", "background": "#0a0e27", "surface": "#1a1f3a", "text": "#00ffff", "textSecondary": "#ff00ff"}'::jsonb,
  '{"light": "0 0 20px rgba(0, 255, 255, 0.5)", "dark": "0 0 40px rgba(255, 0, 255, 0.5)", "glow": "0 0 30px currentColor, 0 0 60px currentColor"}'::jsonb,
  '{"blur": "0px", "opacity": "0.9", "border": "1px solid currentColor"}'::jsonb,
  '{"primary": "linear-gradient(135deg, #00ffff 0%, #0080ff 100%)", "secondary": "linear-gradient(135deg, #ff00ff 0%, #ff0080 100%)", "accent": "linear-gradient(135deg, #ffff00 0%, #ff8000 100%)"}'::jsonb,
  ARRAY['Bright neon colors (cyan, magenta, yellow)', 'Strong glow effects', 'Dark high-contrast backgrounds', 'Sharp angular shapes'],
  ARRAY['shadow-neon', 'shadow-glow', 'border-cyan-400', 'bg-slate-900', 'text-cyan-400'],
  90
),
(
  'gradient',
  'style',
  'Vibrant color blends with smooth transitions',
  ARRAY['gradient', 'gradients', 'color blend', 'fade', 'rainbow', 'spectrum', 'vibrant', 'colorful', 'multi-color'],
  '{"primary": "#667eea", "secondary": "#764ba2", "accent": "#f093fb", "background": "#ffffff", "surface": "#f7fafc", "text": "#2d3748", "textSecondary": "#718096"}'::jsonb,
  '{"light": "0 10px 25px rgba(102, 126, 234, 0.2)", "dark": "0 20px 40px rgba(118, 75, 162, 0.3)", "glow": "0 0 40px rgba(240, 147, 251, 0.4)"}'::jsonb,
  '{"blur": "0px", "opacity": "1", "border": "1px solid transparent"}'::jsonb,
  '{"primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "secondary": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "accent": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"}'::jsonb,
  ARRAY['Smooth color transitions', 'Apply gradients to backgrounds and text', 'Layered depth with gradients', 'Vibrant eye-catching colors'],
  ARRAY['bg-gradient-to-r', 'from-purple-600', 'to-pink-600', 'text-transparent', 'bg-clip-text'],
  85
),
(
  'glassmorphism',
  'style',
  'Frosted glass effect with backdrop blur',
  ARRAY['glassmorphism', 'glass', 'frosted', 'translucent', 'transparent', 'blur', 'backdrop blur', 'acrylic'],
  '{"primary": "#ffffff", "secondary": "#f0f0f0", "accent": "#3b82f6", "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "surface": "rgba(255, 255, 255, 0.1)", "text": "#ffffff", "textSecondary": "rgba(255, 255, 255, 0.7)"}'::jsonb,
  '{"light": "0 8px 32px rgba(31, 38, 135, 0.15)", "dark": "0 8px 32px rgba(0, 0, 0, 0.25)", "glow": "0 0 20px rgba(255, 255, 255, 0.2)"}'::jsonb,
  '{"blur": "10px", "opacity": "0.1", "border": "1px solid rgba(255, 255, 255, 0.18)"}'::jsonb,
  '{"primary": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)", "secondary": "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)", "accent": "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)"}'::jsonb,
  ARRAY['Backdrop blur for frosted glass', 'Semi-transparent backgrounds', 'Subtle borders with transparency', 'Layered depth with blur'],
  ARRAY['backdrop-blur-lg', 'bg-white/10', 'border-white/20', 'shadow-xl'],
  80
),

-- Template Patterns
(
  'material-design',
  'template',
  'Google Material Design with elevation and cards',
  ARRAY['material design', 'material ui', 'google design', 'elevation', 'paper', 'ripple', 'flat design', 'material dashboard'],
  '{"primary": "#1976D2", "secondary": "#424242", "accent": "#FF5722", "background": "#FAFAFA", "surface": "#FFFFFF", "text": "#212121", "textSecondary": "#757575"}'::jsonb,
  '{"light": "0 2px 4px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)", "dark": "0 8px 16px rgba(0, 0, 0, 0.16), 0 4px 8px rgba(0, 0, 0, 0.12)", "glow": "0 0 8px rgba(25, 118, 210, 0.3)"}'::jsonb,
  '{"blur": "0px", "opacity": "1", "border": "1px solid #E0E0E0"}'::jsonb,
  '{"primary": "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)", "secondary": "linear-gradient(135deg, #424242 0%, #303030 100%)", "accent": "linear-gradient(135deg, #FF5722 0%, #E64A19 100%)"}'::jsonb,
  ARRAY['Elevation with subtle shadows', 'Bold colors with proper contrast', '8dp grid system for spacing', 'Card-based layouts'],
  ARRAY['shadow-md', 'rounded-lg', 'p-4', 'bg-white', 'border-gray-200'],
  75
),
(
  'creative-portfolio',
  'template',
  'Canva-style creative portfolio with artistic typography',
  ARRAY['creative portfolio', 'portfolio', 'showcase', 'creative design', 'designer portfolio', 'artistic'],
  '{"primary": "#7B68EE", "secondary": "#2D1B69", "accent": "#FF6B6B", "background": "#FFFFFF", "surface": "#F8F9FA", "text": "#2D1B69", "textSecondary": "#666666"}'::jsonb,
  '{"light": "0 4px 12px rgba(123, 104, 238, 0.1)", "dark": "0 12px 24px rgba(123, 104, 238, 0.2)", "glow": "0 0 20px rgba(123, 104, 238, 0.3)"}'::jsonb,
  '{"blur": "0px", "opacity": "1", "border": "1px solid #E9ECEF"}'::jsonb,
  '{"primary": "linear-gradient(135deg, #7B68EE 0%, #9B8AFE 100%)", "secondary": "linear-gradient(135deg, #2D1B69 0%, #4A3490 100%)", "accent": "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)"}'::jsonb,
  ARRAY['Bold artistic typography', 'Visual hierarchy with large headings', 'Gallery grids for projects', 'Strong CTAs with accent colors'],
  ARRAY['text-6xl', 'font-bold', 'grid', 'grid-cols-3', 'gap-6', 'rounded-2xl'],
  70
),
(
  'modern',
  'style',
  'Contemporary professional design',
  ARRAY['modern', 'contemporary', 'sleek', 'professional', 'business', 'corporate', 'elegant'],
  '{"primary": "#3b82f6", "secondary": "#8b5cf6", "accent": "#06b6d4", "background": "#ffffff", "surface": "#f9fafb", "text": "#111827", "textSecondary": "#6b7280"}'::jsonb,
  '{"light": "0 4px 6px rgba(0, 0, 0, 0.07)", "dark": "0 10px 15px rgba(0, 0, 0, 0.1)", "glow": "0 0 15px rgba(59, 130, 246, 0.3)"}'::jsonb,
  '{"blur": "0px", "opacity": "1", "border": "1px solid #e5e7eb"}'::jsonb,
  '{"primary": "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", "secondary": "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", "accent": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"}'::jsonb,
  ARRAY['Clean layouts', 'Professional typography', 'Subtle animations', 'Consistent spacing'],
  ARRAY['shadow-lg', 'rounded-xl', 'transition-all', 'hover:scale-105'],
  65
);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger on_design_schemas_updated
  before update on public.design_schemas
  for each row
  execute procedure public.handle_updated_at();

-- Create function to get design schema by keyword
create or replace function public.get_design_schema_by_keyword(search_keyword text)
returns table (
  pattern_name text,
  pattern_type text,
  description text,
  color_scheme jsonb,
  guidelines text[]
) as $$
begin
  return query
  select 
    ds.pattern_name,
    ds.pattern_type,
    ds.description,
    ds.color_scheme,
    ds.guidelines
  from public.design_schemas ds
  where ds.is_active = true
    and search_keyword ilike any(ds.keywords)
  order by ds.priority desc
  limit 1;
end;
$$ language plpgsql security definer;
