# 🚀 Quick Deploy - AI Web Designer Edge Function

## One-Command Deploy (After Setup)

```bash
# 1. Install Supabase CLI (once)
npm install -g supabase

# 2. Login (once)
supabase login

# 3. Link project (once) - Get YOUR_PROJECT_REF from Supabase dashboard
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set OpenAI key (once)
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here

# 5. Deploy! (run anytime you update the function)
supabase functions deploy ai-code-assistant
```

---

## ✅ Verify It's Working

Test in your browser console at: https://unison-tasks-i2wjrv6av-unrealdev02s-projects.vercel.app

```javascript
// Test basic generation
fetch('https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-code-assistant', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Create a modern hero section' }],
    mode: 'code'
  })
}).then(r => r.text()).then(console.log)
```

---

## 🎨 What You Get

### Component Variance (Different Every Time!)

**Try this 3 times and get 3 different layouts:**
```
"Create a hero section"
```

**You'll see:**
1. First time: Full-screen gradient with particles ✨
2. Second time: Split 50/50 with floating card 📊
3. Third time: Video background with glassmorphism 🎥

**Same for everything:**
- Pricing cards: 3-col, comparison, toggle, tiered, carousel
- Navigation: Sticky, mega menu, drawer, floating, split
- Testimonials: Grid, carousel, masonry, video, featured

### Design Theory Applied

✅ **Visual Hierarchy**: Typography scales (text-7xl → text-xs)
✅ **White Space**: Generous padding (py-20, p-8, gap-6)
✅ **Color Psychology**: Professional gradients (purple-blue, pink-orange)
✅ **Motion Design**: Smooth animations (hover:scale-105, fade-in)
✅ **Fluid Flexbox**: Responsive layouts (flex gap-4, justify-between)

### Quality Standards

- **Lovable AI**: Production-ready, no placeholders
- **Figma**: Pixel-perfect spacing on 4px grid
- **WordPress**: Template variety, creative freedom
- **Accessibility**: ARIA labels, semantic HTML, keyboard nav
- **Responsive**: Mobile-first with md:, lg:, xl: breakpoints

---

## 🔥 Quick Examples to Try

### 1. Hero Section
```
"Create a modern hero section with gradient background and animated particles"
```

### 2. Pricing Cards
```
"Design responsive pricing cards with 3 tiers and a highlighted Pro plan"
```

### 3. Navigation
```
"Build a sticky navigation that becomes solid on scroll with smooth transitions"
```

### 4. Testimonials
```
"Create a testimonials grid with star ratings and customer avatars"
```

### 5. Landing Page
```
"Generate a complete landing page with hero, features, pricing, and testimonials"
```

---

## 📊 Expected Results

### ❌ Before (Boring & Static)
- Same layout every time
- Generic templates
- No creativity
- Rigid designs

### ✅ After (Dynamic & Professional)
- **Different layouts** every generation
- **Creative variance** in structure
- **Smooth animations** and transitions
- **Fluid flexbox** responsive designs
- **Industry-level quality**

---

## 🎯 Production URLs

**Frontend**: https://unison-tasks-i2wjrv6av-unrealdev02s-projects.vercel.app

**Edge Function** (after deploy): 
https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-code-assistant

**Supabase Dashboard**: 
https://app.supabase.com/project/YOUR_PROJECT_REF

---

## 💡 Pro Tips

1. **Higher Creativity**: Edit `index.ts` and set `temperature: 0.9`
2. **More Consistent**: Set `temperature: 0.6`
3. **Custom Patterns**: Add keywords in system prompt
4. **View Logs**: `supabase functions logs ai-code-assistant`
5. **Test Locally**: `supabase functions serve ai-code-assistant`

---

## 🆘 Quick Troubleshooting

**"Function not found"**
```bash
supabase functions list
# If empty, redeploy
supabase functions deploy ai-code-assistant
```

**"OpenAI error"**
```bash
supabase secrets list
# If OPENAI_API_KEY missing, set it
supabase secrets set OPENAI_API_KEY=sk-...
```

**"Still getting repetitive outputs"**
- Check edge function is deployed: `supabase functions list`
- Verify temperature is 0.8 in index.ts
- Clear browser cache and try again

---

## 🎉 You're Done!

Your AI Code Assistant now generates:
- ✨ Varied, creative layouts (not boring!)
- 💎 Professional quality (Lovable AI standards)
- 📐 Design theory applied (Figma precision)
- 🎨 Fluid responsive designs (WordPress flexibility)
- 🚀 Production-ready code (no placeholders)

**Go create something amazing!** 🌟
