# Deploy Enhanced AI Code Assistant Edge Function

## 🚀 Quick Deploy

The enhanced edge function with professional design theory is ready in:
`supabase/functions/ai-code-assistant/index.ts`

### Step 1: Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref at: https://app.supabase.com/project/_/settings/general

### Step 4: Set Environment Variables

```bash
# Set OpenAI API Key
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### Step 5: Deploy the Function

```bash
supabase functions deploy ai-code-assistant
```

---

## 🎨 What This Enhanced Function Provides

### Core Enhancements

1. **Professional Design Theory**
   - Visual hierarchy with typography scales
   - White space and breathing room (Figma standards)
   - Color psychology with gradient palettes
   - Motion design with smooth animations

2. **Component Variance (5 Variants Each)**
   - Hero Sections: Full-screen, split, video, 3D, minimal
   - Pricing Cards: 3-column, comparison table, toggle billing, tiered, carousel
   - Navigation: Sticky, mega menu, side drawer, floating, split
   - Testimonials: Grid, carousel, masonry, video, featured

3. **Fluid Flexbox Integration**
   - Dynamic responsive layouts with gap utilities
   - Professional spacing system (p-4, p-6, gap-4)
   - Mobile-first breakpoints (md:, lg:, xl:)
   - Adaptive sizing (flex-1, flex-shrink-0)

4. **Industry Standards**
   - Lovable AI production quality
   - Figma pixel-perfect precision
   - WordPress template flexibility
   - Tailwind CSS best practices
   - Full accessibility support

### System Prompt Features

**Creativity & Variance**:
- Temperature: 0.8 (higher for more creativity)
- Frequency penalty: 0.3 (reduce repetition)
- Presence penalty: 0.3 (encourage new topics)
- Each component generation is unique and professional

**Pattern Detection Integration**:
- Receives `detectedPattern` and `patternColors` from frontend
- Uses as inspiration, not rigid constraints
- Maintains creative freedom while respecting user preferences

**Mode-Specific Enhancements**:
- **Code Mode**: Full React/TypeScript components with Tailwind
- **Design Mode**: Expert recommendations with specific classes
- **Review Mode**: Performance, accessibility, best practice analysis

---

## 🧪 Testing After Deployment

### 1. Test Basic Generation

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-code-assistant \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create a modern hero section with gradient background"
      }
    ],
    "mode": "code"
  }'
```

### 2. Test Pattern Detection

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-code-assistant \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Create a glassmorphism pricing card"
      }
    ],
    "mode": "code",
    "detectedPattern": "glassmorphism",
    "patternColors": {
      "primary": "rgba(255, 255, 255, 0.1)",
      "border": "rgba(255, 255, 255, 0.18)"
    }
  }'
```

### 3. Test Component Variance

Try the same prompt multiple times and verify you get **different, creative layouts** each time:

```
"Create a hero section"
"Create a hero section"
"Create a hero section"
```

Expected: 3 different variants (full-screen, split, video, etc.)

---

## 🎯 Expected AI Behavior

### Before Enhancement
❌ Generic, repetitive templates
❌ Static layouts with no variance
❌ Boring, cookie-cutter components
❌ Limited creativity

### After Enhancement
✅ Unique layouts every generation
✅ Professional gradients and animations
✅ Fluid, responsive flexbox designs
✅ Lovable AI production quality
✅ Figma-level precision
✅ WordPress-style variety
✅ Creative freedom with design theory

---

## 📊 Monitoring & Logs

### View Function Logs

```bash
supabase functions logs ai-code-assistant
```

### Check Function Status

```bash
supabase functions list
```

### Update Function (After Changes)

```bash
supabase functions deploy ai-code-assistant --no-verify-jwt
```

---

## 🔧 Troubleshooting

### Issue: "Function not found"
**Solution**: Verify deployment and project linking
```bash
supabase functions list
supabase link --project-ref YOUR_PROJECT_REF
```

### Issue: "OpenAI API error"
**Solution**: Check API key is set correctly
```bash
supabase secrets list
supabase secrets set OPENAI_API_KEY=sk-...
```

### Issue: "CORS error in browser"
**Solution**: Edge function includes CORS headers, check browser console for details

### Issue: "Repetitive outputs"
**Solution**: Verify temperature (0.8) and penalty settings (0.3) in function code

---

## 🎨 Customization

### Adjust Creativity Level

Edit `supabase/functions/ai-code-assistant/index.ts`:

```typescript
// More creative (0.9-1.0)
temperature: 0.9,

// More consistent (0.5-0.7)
temperature: 0.6,
```

### Add Custom Patterns

Add to `CORE_SYSTEM_PROMPT`:

```typescript
- **"retro"**: Vintage colors, serif fonts, retro animations
- **"brutalist"**: Bold typography, stark contrasts, geometric shapes
```

### Change AI Model

```typescript
model: "gpt-4-turbo-preview", // Best quality, slower
model: "gpt-4", // Balanced
model: "gpt-3.5-turbo", // Faster, cheaper
```

---

## ✅ Deployment Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Project linked (`supabase link`)
- [ ] OpenAI API key set (`supabase secrets set`)
- [ ] Function deployed (`supabase functions deploy`)
- [ ] Test basic generation (curl or frontend)
- [ ] Verify component variance (multiple generations)
- [ ] Check pattern detection works
- [ ] Monitor logs for errors
- [ ] Test all 3 modes (code, design, review)

---

## 🚀 Go Live!

Once deployed, your AI Code Assistant will generate:
- **Varied hero sections** (not boring static layouts)
- **Professional pricing cards** (3-col, comparison, toggle)
- **Modern navigation bars** (sticky, mega menu, floating)
- **Beautiful testimonials** (grid, carousel, masonry)
- **Fluid flexbox layouts** (responsive, dynamic)
- **Industry-level quality** (Lovable AI + Figma + WordPress)

**Production URL**: Your existing deployment will automatically use the enhanced edge function once deployed!

Enjoy your professional, creative, dynamic AI Web Designer! 🎨✨
