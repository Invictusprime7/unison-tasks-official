# 🗺️ How to Use Map Elements in Web Builder

## ✅ Maps Are Now Featured in the Left Panel!

### Quick Start:
1. **Open Web Builder**: http://localhost:8083/web-builder
2. **Look at Left Panel**: Scroll down to find the new map categories
3. **Find Map Elements**: Look for these sections:
   - 📍 **Business Maps** - Business location with contact info
   - 🌍 **Global Maps** - World map displays  
   - 🃏 **Map Cards** - Compact map cards
   - 📺 **Media & Maps** - Basic map embeds

### Available Map Elements:

#### 1. 📍 **Business Location**
- **Category**: Business Maps
- **Use For**: Restaurants, stores, offices
- **Features**: Contact info + interactive map
- **Perfect For**: "Visit Us" sections

#### 2. 🌍 **Multiple Locations** 
- **Category**: Business Maps
- **Use For**: Multi-branch businesses
- **Features**: Multiple markers on one map
- **Perfect For**: "Our Offices" sections

#### 3. 🃏 **Compact Map Card**
- **Category**: Map Cards  
- **Use For**: Sidebars, business cards
- **Features**: Small map with contact details
- **Perfect For**: Footer sections, contact cards

#### 4. 🌐 **World Map Display**
- **Category**: Global Maps
- **Use For**: Global companies, statistics
- **Features**: Dark theme, global presence stats
- **Perfect For**: "About Us", company overview

#### 5. 🗺️ **Map (Leaflet)**
- **Category**: Media & Maps
- **Use For**: Basic map embedding
- **Features**: Simple interactive map
- **Perfect For**: Any location display

### How to Add Maps:

1. **Navigate to Web Builder**:
   ```
   http://localhost:8083/web-builder
   ```

2. **Open Left Panel**: Look for the component categories

3. **Find Map Categories**: 
   - Business Maps 📍
   - Global Maps 🌍  
   - Map Cards 🃏
   - Media & Maps 📺

4. **Click Any Map Element**: It will be added to your canvas

5. **Customize**: Edit the map data, markers, and styling

### Map Configuration:

Each map element uses `<ai-map>` tags with these attributes:
- `data-center="lat,lng"` - Map center coordinates
- `data-zoom="12"` - Zoom level (1-20)  
- `data-markers='[...]'` - JSON array of markers
- `data-width="100%"` - Map width
- `data-height="400px"` - Map height

### Live Preview:

- Maps show as **gray placeholders** in the canvas editor
- Maps become **fully interactive** in the live preview dialog
- Click "Preview" to see maps working with real Leaflet functionality

### Example Marker Data:
```json
[
  {
    "position": [40.7128, -74.0060],
    "title": "New York Office", 
    "popup": "Our main headquarters"
  }
]
```

## 🎉 Ready to Use!

Your Web Builder now has **5 different map elements** ready to drag and drop into any project. Maps work perfectly with:

- ✅ Interactive pan/zoom
- ✅ Custom markers  
- ✅ Popup information
- ✅ Responsive design
- ✅ Business contact integration
- ✅ Multiple location support

**Start building with maps at**: http://localhost:8083/web-builder