# Build to Canvas Workflow

## 🎯 New AI Template Flow

### Step 1: AI Generates Template
User requests: "Create a landing page for a SaaS product"

AI responds with:
```
✨ **Template Generated!**

Your template is ready

📋 **Template Details:**
• 3 sections
• SaaS Landing Page

Click "Build to Canvas" below to add it as fully editable components!
```

### Step 2: Preview Template
- Template is stored but NOT rendered yet
- User can review the AI response
- "Build to Canvas" button appears below AI message

### Step 3: Build to Canvas
User clicks **"Build to Canvas"** button:
1. ✅ Template renders to Fabric.js canvas
2. ✅ All components are **individually editable**
3. ✅ Each element has:
   - Resize controls
   - Selection borders
   - Move/drag capability
   - Text editing (for text elements)
   - Independent styling

### Step 4: Edit Components
Every template component is now fully editable:

**Text Elements:**
- ✅ Click to edit text inline
- ✅ Resize with corner handles
- ✅ Change color, font, size
- ✅ Move anywhere on canvas

**Shapes/Rectangles:**
- ✅ Resize with corner handles
- ✅ Change fill color
- ✅ Adjust border radius
- ✅ Move, rotate, scale

**Images:**
- ✅ Resize and scale
- ✅ Move and position
- ✅ Replace image source
- ✅ Adjust opacity

**Buttons:**
- ✅ Background is separate editable shape
- ✅ Text is separate editable text
- ✅ Both can be edited independently
- ✅ Resize, recolor, reposition

## 🚀 Key Features

### 1. **Preview Before Building**
- AI generates template
- Template info shown in chat
- No automatic canvas render
- User controls when to build

### 2. **Fully Editable Components**
Every component rendered with:
```typescript
{
  selectable: true,      // Can be selected
  editable: true,        // Text can be edited
  hasControls: true,     // Shows resize handles
  hasBorders: true,      // Shows selection outline
  lockScalingFlip: false // Allows all transformations
}
```

### 3. **Component Identification**
Each component has a `name` property:
- "Hero Title"
- "Hero Button Background"
- "Hero Button Text"
- "Feature Card 1"

This helps identify components in the canvas.

### 4. **Independent Elements**
Unlike grouped elements:
- Each text is independent
- Each shape is independent
- Button backgrounds and text are separate
- All can be edited individually

## 📋 Component Types & Editability

| Component Type | Editable Features |
|----------------|-------------------|
| **Text** | Inline editing, resize, move, style |
| **Shape** | Resize, move, fill color, border radius |
| **Image** | Resize, move, scale, replace source |
| **Button** | Background (shape) + Text (separate) |
| **Container** | Renders children as individual elements |

## 🎨 User Experience

### Before (Old Workflow):
```
User: "Create a landing page"
→ Template renders immediately
→ Components might be locked/grouped
→ Hard to edit individual elements
```

### After (New Workflow):
```
User: "Create a landing page"
→ AI generates template
→ Shows preview info
→ User clicks "Build to Canvas"
→ All components render as editable
→ Easy to customize everything
```

## 🔧 Technical Implementation

### AIAssistantPanel Changes:
1. Template messages store the `template` object
2. "Build to Canvas" button appears for template messages
3. `pendingTemplates` Map tracks templates by message index
4. Clicking button triggers `onTemplateGenerated` callback

### TemplateRenderer Changes:
1. All Fabric objects get `selectable: true`
2. Text objects get `editable: true`
3. All objects get `hasControls: true` and `hasBorders: true`
4. Each object gets a `name` property for identification
5. Button components render as 2 separate objects (bg + text)

### WebBuilder Integration:
- Receives template via callback
- Calls `useTemplateState.updateTemplate()`
- Template renders to canvas with full editability
- User can immediately start editing

## 🎯 Benefits

1. **User Control** - Choose when to build
2. **Full Editability** - Every element is editable
3. **Clear Workflow** - Preview → Build → Edit
4. **Professional UX** - Clean, understandable interface
5. **Flexible** - Can generate multiple templates before building
6. **Canvas-First** - All components on Fabric.js canvas for rich editing

## 📱 UI Flow

```
┌─────────────────────────────────┐
│  AI: Template Generated! ✨     │
│                                 │
│  3 sections                     │
│  SaaS Landing Page              │
│                                 │
│  ┌───────────────────────────┐ │
│  │  🔨 Build to Canvas       │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
         ↓ Click
┌─────────────────────────────────┐
│  Canvas Rendering...            │
│  ✅ Hero Section                │
│  ✅ Features Section            │
│  ✅ CTA Section                 │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  [Editable Canvas]              │
│  ┌─────────────────┐            │
│  │ Hero Title █    │ ← Editable │
│  └─────────────────┘            │
│  ┌─────┐                        │
│  │ CTA █│ ← Editable            │
│  └─────┘                        │
└─────────────────────────────────┘
```

## 🚦 States & Indicators

- **Generating**: Spinner shows "Creating your design..."
- **Generated**: Template info + "Build to Canvas" button
- **Building**: Toast shows "Rendering template..."
- **Built**: Toast shows "✨ AI template rendered successfully!"
- **Ready**: All components selectable on canvas

## 💡 Tips for Users

1. **Generate first, build later** - You can generate multiple templates
2. **Each element is separate** - Click to select and edit
3. **Text is inline-editable** - Double-click text to edit
4. **Undo/Redo works** - Use Ctrl+Z / Ctrl+Y
5. **Save often** - Use Ctrl+S to save your work
