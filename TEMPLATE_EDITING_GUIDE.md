# Web Builder Template Editing - Full Feature Guide

## Overview
Your Web Builder now has comprehensive full-scale editing capabilities for AI-generated templates. Users can edit every aspect of templates in live preview.

---

## Canvas Editing (Fabric.js Objects)

### **Typography Editing**
When a text object is selected on canvas, users can edit via the **WebPropertiesPanel**:

#### Text Content
- **Direct editing**: Double-click any text to edit inline
- **Properties panel**: Edit text content in Style tab

#### Font Controls
- **Font Family**: Arial, Helvetica, Times New Roman, Georgia, Verdana, Courier New, Inter, Roboto
- **Font Size**: 8px - 200px (numeric input)
- **Font Weight**: Normal, Bold, Thin (100), Light (300), Medium (500), Semi Bold (600), Bold (700), Black (900)
- **Text Align**: Left, Center, Right, Justify

#### Text Styling
- **Fill Color**: Color picker + hex input
- **Font Style**: Controlled via font weight selector
- **All standard text formatting**

### **Image Editing**
For image objects:
- **Resize**: Drag corner handles
- **Move**: Drag to reposition
- **Rotate**: Use rotation handle or angle slider
- **Replace**: Via Image tab (ImageOperationsPanel)
- **Opacity**: 0-100% slider
- **Filters**: Available in Image Operations tab

### **Shape Editing**
For shapes (rectangles, circles, etc.):
- **Fill Color**: Color picker with hex input
- **Stroke Color**: Color picker
- **Stroke Width**: Numeric input
- **Border Radius**: For rectangles (rx/ry)
- **Size**: Width & height controls
- **Position**: X & Y coordinates
- **Rotation**: 0-360° slider

### **Layout Controls** (All Objects)
- **Position**: Precise X, Y coordinates
- **Size**: Width & Height (respects scaling)
- **Rotation**: 0-360° with live slider
- **Padding**: Spacing control
- **Layer Order**: 
  - Bring Forward button
  - Send Backward button

### **Advanced Effects**
- **Opacity**: 0-100% slider
- **Blend Modes**: Normal, Multiply, Screen, Overlay, Darken, Lighten, Color Dodge, Color Burn, Hard Light, Soft Light, Difference, Exclusion
- **Shadow**: Custom shadow input (e.g., `0 4px 6px rgba(0,0,0,0.1)`)
- **Skew X**: -45° to +45°
- **Skew Y**: -45° to +45°

---

## HTML/CSS Editing (Live Preview Elements)

### **Content Editing**
Via **HTMLElementPropertiesPanel** when elements are selected in live preview:

#### Text Elements (h1, h2, h3, p, span, button, label)
- **Text Content**: Direct input field
- **Typography**: Full font controls
- **Formatting**: Bold, Italic, Underline buttons
- **Alignment**: Left, Center, Right, Justify buttons
- **Color**: Text color picker

#### Images
- **Source URL**: Edit image src attribute
- **All layout controls**

#### Links
- **URL**: Edit href attribute
- **Text content**
- **Styling**

### **Typography Controls** (HTML)
- **Font Family**: 15+ fonts including Inter, Roboto
- **Font Size**: Predefined sizes (10px - 72px)
- **Font Weight/Style**:
  - Bold toggle
  - Italic toggle
  - Underline toggle
- **Text Alignment**: 4-way alignment buttons
- **Text Color**: Color picker + hex input
- **Background Color**: Full color controls

### **Layout & Spacing** (HTML)
- **Padding**: Numeric input in pixels
- **Margin**: Numeric input in pixels
- **Width**: auto, percentage, or pixel values
- **Height**: auto, percentage, or pixel values

#### **Display Modes**
- Block
- Inline
- Inline Block
- **Flex** (with advanced controls)
- **Grid** (with advanced controls)
- None

#### **Flexbox Controls** (when display: flex)
- **Flex Direction**: Row, Column, Row Reverse, Column Reverse
- **Justify Content**: Start, Center, End, Space Between, Space Around, Space Evenly
- **Align Items**: Stretch, Start, Center, End, Baseline
- **Gap**: Numeric spacing in pixels

#### **Grid Controls** (when display: grid)
- **Grid Template Columns**: e.g., `1fr 1fr 1fr`
- **Grid Template Rows**: e.g., `auto auto`
- **Gap**: Numeric spacing in pixels

#### **Position Controls**
- Static
- Relative
- Absolute
- Fixed
- Sticky

### **Styling Controls** (HTML)
- **Background Color**: Color picker
- **Border**: Input for border properties
- **Border Radius**: Rounded corners
- **Opacity**: Percentage slider

---

## Template Editability Features

### **All AI-Generated Components Are Fully Editable**
- ✅ Text layers: Content, font, size, color, alignment
- ✅ Image layers: Source, size, position, effects
- ✅ Shape layers: Fill, stroke, size, radius
- ✅ Layout containers: Flexbox & Grid with full controls
- ✅ Spacing: Padding & margin controls
- ✅ Effects: Opacity, shadows, blend modes, skew

### **Editability Modes**
1. **Canvas Mode**: Fabric.js objects with visual handles
   - Resize handles on corners
   - Rotation handle at top
   - Selection borders
   - Drag to move
   - Double-click text to edit

2. **Live Preview Mode**: HTML elements with properties panel
   - Click any element to select
   - Properties panel opens automatically
   - Real-time CSS updates
   - Layout controls for positioning

### **Metadata Tracking**
All template objects include metadata:
```typescript
templateLayer: {
  id: string;        // Layer identifier
  type: string;      // text, image, shape
  name: string;      // Display name
  originalSrc?: string; // For images
  shape?: string;    // For shapes (circle, rectangle)
}
```

---

## Integration with AI Templates

### **When Templates Are Generated**
1. AI creates template schema
2. `TemplateRenderer` renders to Fabric canvas
3. All objects get `selectable: true`, `editable: true`
4. Objects include full control handles
5. Properties panels ready for editing

### **Live Preview Synchronization**
- Canvas edits update fabric objects immediately
- HTML edits update live preview in real-time
- Both editing modes work simultaneously
- Changes persist during session

---

## User Workflow

### **Editing Canvas Objects**
1. AI generates template → Renders to canvas
2. User clicks any object → Properties panel opens
3. User edits via:
   - Direct manipulation (drag, resize, rotate)
   - Properties panel controls (precise values)
   - Inline editing (double-click text)
4. Changes apply immediately with live rendering

### **Editing HTML Elements**
1. Template renders in live preview
2. User clicks element in preview → Selection confirmed
3. HTMLElementPropertiesPanel opens automatically
4. User edits:
   - Content (text, links, images)
   - Typography (fonts, sizes, colors)
   - Layout (flexbox, grid, spacing)
   - Styling (colors, borders, effects)
5. Changes update in real-time

### **Division/Section Rearrangement**
Users can rearrange template sections using:
- **Flexbox controls**: Change flex-direction, order
- **Grid controls**: Modify grid-template-columns/rows
- **Position controls**: Absolute/relative positioning
- **Layer order**: Bring forward/send backward on canvas

---

## Feature Matrix

| Feature | Canvas (Fabric.js) | HTML Live Preview |
|---------|-------------------|-------------------|
| **Text Editing** | ✅ Inline + Panel | ✅ Panel Only |
| **Typography** | ✅ Full Control | ✅ Full Control |
| **Images** | ✅ Resize, Replace | ✅ URL Edit |
| **Colors** | ✅ Fill, Stroke | ✅ Text, Background |
| **Layout** | ✅ X, Y, W, H | ✅ Flexbox, Grid |
| **Spacing** | ✅ Padding | ✅ Padding, Margin |
| **Effects** | ✅ Shadow, Blend, Skew | ✅ Opacity, Borders |
| **Rotation** | ✅ 0-360° | ❌ Not applicable |
| **Layer Order** | ✅ Forward/Backward | ❌ Not applicable |
| **Position** | ✅ Drag & Drop | ✅ Static/Relative/Absolute |

---

## Key Enhancements Made

### **WebPropertiesPanel** (`web-builder/WebPropertiesPanel.tsx`)
- ✅ Added text content editing for text objects
- ✅ Added full typography controls (family, size, weight, align)
- ✅ Added padding control for templates
- ✅ Added layer order buttons (bring forward/send backward)
- ✅ Enhanced effects tab with shadow input
- ✅ Added skew X/Y sliders
- ✅ Expanded blend mode options (12 modes)

### **HTMLElementPropertiesPanel** (`web-builder/HTMLElementPropertiesPanel.tsx`)
- ✅ Added Flexbox advanced controls
  - Flex direction selector
  - Justify content (6 options)
  - Align items (5 options)
  - Gap control
- ✅ Added Grid advanced controls
  - Grid template columns
  - Grid template rows
  - Gap control
- ✅ Added position controls (5 modes)
- ✅ Enhanced layout tab with container controls

### **TemplateRenderer** (`utils/templateRenderer.ts`)
- ✅ Set all objects to `selectable: true` by default
- ✅ Set all text objects to `editable: true`
- ✅ Enabled all control handles by default
- ✅ Added `templateLayer` metadata to all objects
- ✅ Added lock controls (lockMovementX/Y, lockRotation, lockScaling)
- ✅ Enhanced with proper default values for all properties

---

## Technical Implementation

### **Template Rendering Flow**
```
AI Template Generated
    ↓
TemplateRenderer.renderTemplate()
    ↓
For each layer:
  - Create Fabric object (IText, FabricImage, Rect, Circle)
  - Set editability: selectable, editable, hasControls = true
  - Add templateLayer metadata
  - Add to canvas
    ↓
User selects object
    ↓
WebPropertiesPanel shows controls
    ↓
User edits → updateProperty() → canvas.renderAll()
```

### **HTML Preview Flow**
```
Template renders in SecureIframePreview
    ↓
User clicks element
    ↓
LiveHTMLPreview.onElementSelect() fires
    ↓
HTMLElementPropertiesPanel opens
    ↓
User edits → updateStyle() → onUpdateElement()
    ↓
Changes apply to preview in real-time
```

---

## Summary

Your Web Builder now provides **professional-grade template editing** with:
- ✅ **Full typography control** - Edit fonts, sizes, weights, colors
- ✅ **Complete image editing** - Resize, replace, transform, filter
- ✅ **Advanced layout tools** - Flexbox & Grid with full controls
- ✅ **Visual effects** - Shadows, blend modes, opacity, skew
- ✅ **Precise positioning** - X/Y coordinates, rotation, layer order
- ✅ **Division rearrangement** - Layout modes for section positioning
- ✅ **Real-time preview** - Changes apply immediately
- ✅ **Dual editing modes** - Canvas manipulation + Properties panels

All AI-generated templates are **immediately editable** with no additional setup required!
