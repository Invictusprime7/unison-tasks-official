# File Library - Complete Guide

## Overview

The **File Library** is a comprehensive file management system integrated into the Web Builder, allowing users to upload, browse, and instantly insert files into their web designs with a single click. All uploaded files and AI-generated images are stored securely in Supabase Storage and can be reused across projects.

## Features

### 📁 **File Management**
- **Upload files** - Drag-drop or browse to upload multiple files
- **Browse library** - View all your uploaded files and AI-generated images
- **Search files** - Quick search by filename
- **Filter by type** - Tabs for All, Images, Videos, Documents
- **Favorites** - Star important files for quick access
- **Delete files** - Remove unwanted files from storage

### ⚡ **Click-to-Insert**
Simply click any file in the library to **instantly add it to your canvas** - no dragging required!

### 🎨 **Smart Content Insertion**
The system automatically inserts files with appropriate HTML elements based on type:

#### **Images** → Advanced Figure Element
```html
<figure class="relative group overflow-hidden rounded-2xl shadow-2xl">
  <img 
    src="[signed-url]" 
    alt="filename.jpg"
    loading="lazy"
    class="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
  />
  <figcaption class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <p class="text-sm font-medium">filename.jpg</p>
  </figcaption>
</figure>
```

**Features:**
- ✅ Lazy loading for performance
- ✅ Responsive design (max-width: 100%)
- ✅ Hover zoom effect (scale 105%)
- ✅ Caption overlay with gradient
- ✅ Rounded corners and shadow

#### **Videos** → HTML5 Video Player
```html
<video 
  src="[signed-url]" 
  controls 
  class="w-full rounded-lg shadow-lg"
  style="max-width: 100%;"
>
</video>
```

**Features:**
- ✅ Native browser controls (play, pause, volume, fullscreen)
- ✅ Responsive sizing
- ✅ Rounded corners and shadow

#### **Audio** → HTML5 Audio Player
```html
<audio 
  src="[signed-url]" 
  controls 
  class="w-full"
>
</audio>
```

**Features:**
- ✅ Native browser controls
- ✅ Full-width layout

#### **Documents** → Download Link
```html
<a 
  href="[signed-url]" 
  download="document.pdf"
  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
>
  <svg class="w-5 h-5"><!-- Download icon --></svg>
  <span>Download document.pdf</span>
</a>
```

**Features:**
- ✅ Automatic download on click
- ✅ Custom styled button
- ✅ Download icon

## Usage

### Opening the File Library

**Method 1: Toolbar Button**
1. Click the **"Files"** button in the top toolbar (blue-highlighted)
2. Library opens in the right panel

**Method 2: Keyboard Shortcut**
- Press **`Ctrl+L`** to toggle the File Library

### Uploading Files

1. **Click "Choose Files to Upload"** button
   - Or drag-drop files directly into the upload area
   
2. **Select files** from your computer
   - Supported types: Images, Videos, Audio, Documents (PDF, DOC, TXT)
   - Multiple files can be selected at once

3. **Click "Upload"**
   - Progress bar shows upload status
   - Files appear in library when complete

### Browsing Files

**Filter by Type:**
- **All** - View all files
- **Images** - Only image files (JPEG, PNG, GIF, WebP, etc.)
- **Videos** - Only video files (MP4, WebM, MOV, etc.)
- **Documents** - Only documents (PDF, DOC, DOCX, TXT, etc.)

**Search:**
- Type in the search box to filter files by name
- Search works across all file types

**Sort:**
- Files are sorted by upload date (newest first)

### Inserting Files

**Simply click any file** in the library:
1. File is instantly added to the canvas preview
2. HTML code is automatically generated
3. File appears in Code Editor
4. Toast notification confirms insertion

**What Happens:**
```
Click File → Get Signed URL → Generate HTML → Insert to Canvas → Update Code
```

### File Actions

**Hover over any file** to reveal action buttons:

1. **⭐ Favorite** - Star/unstar files for quick access
2. **🗑️ Delete** - Remove file from library (requires confirmation)
3. **➕ Insert** - Manually insert file (same as clicking the file)

### File Information

Each file displays:
- **Preview thumbnail** (for images) or **icon** (for other types)
- **Filename** - Full name with extension
- **File type badge** - Color-coded label (Image, Video, Audio, Document)
- **File size** - Human-readable format (KB, MB, GB)
- **Upload date** - Relative time (e.g., "2 hours ago")

## AI-Generated Images

**All AI-generated images are automatically saved to the File Library!**

When you generate an image using the AI Image Generator:
1. Image is uploaded to Supabase Storage
2. Metadata is saved to database
3. Image appears in File Library under "Images" tab
4. Can be reused in other projects

**Storage Path:** `{userId}/generated-images/{filename}.png`

## Storage & Security

### Supabase Storage

Files are stored in the `user-files` bucket:
```
user-files/
├── {userId}/
│   ├── {timestamp}-filename.jpg
│   ├── {timestamp}-document.pdf
│   └── generated-images/
│       └── ai-generated-{timestamp}.png
└── anonymous/
    └── {timestamp}-filename.jpg (for non-authenticated users)
```

### Signed URLs

For security, all file access uses **Supabase signed URLs**:
- Valid for 1 hour
- Automatically refreshed when needed
- No direct public access to files

### File Metadata

Stored in `files` table:
```typescript
{
  id: string;
  user_id: string | null;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  folder_path: string;
  is_favorite: boolean;
  created_at: timestamp;
}
```

## Advanced Features

### Programmatic File Insertion

```typescript
import { FileLibraryPanel } from '@/components/creatives/web-builder/FileLibraryPanel';

<FileLibraryPanel
  onFileInsert={(fileUrl, fileName, mimeType) => {
    console.log('File inserted:', { fileUrl, fileName, mimeType });
    // Custom insertion logic
  }}
  onClose={() => setFileLibraryOpen(false)}
/>
```

### File Upload Programmatically

```typescript
import { supabase } from '@/integrations/supabase/client';

const uploadFile = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  const filePath = `${user?.id}/${Date.now()}-${file.name}`;
  
  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('user-files')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Save metadata
  const { error: dbError } = await supabase.from('files').insert({
    user_id: user?.id,
    name: file.name,
    size: file.size,
    mime_type: file.type,
    storage_path: filePath,
    folder_path: '/web-builder'
  });
  
  if (dbError) throw dbError;
};
```

### Get Signed URL

```typescript
const { data } = await supabase.storage
  .from('user-files')
  .createSignedUrl(file.storage_path, 3600); // 1 hour

const signedUrl = data?.signedUrl;
```

### Query Files

```typescript
const { data: files } = await supabase
  .from('files')
  .select('*')
  .like('mime_type', 'image/%') // Filter by type
  .order('created_at', { ascending: false });
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+L` | Toggle File Library |
| `Ctrl+I` | AI Image Generator |
| `Ctrl+S` | Save |
| `Ctrl+K` | Toggle Code View |

## Best Practices

### File Naming
- ✅ Use descriptive names: `hero-background.jpg`
- ✅ Avoid special characters: Use `-` or `_` instead of spaces
- ❌ Avoid: `IMG_1234.jpg`, `Untitled.png`

### File Organization
- Use **Favorites** for frequently used files
- Delete unused files to save storage space
- Search by descriptive keywords

### File Types
**Recommended formats:**
- **Images:** JPEG (photos), PNG (graphics with transparency), WebP (modern web)
- **Videos:** MP4 (best compatibility), WebM (smaller size)
- **Audio:** MP3 (best compatibility), OGG (open format)
- **Documents:** PDF (universal), TXT (plain text)

### Optimization
- **Compress images** before uploading (aim for <500KB for web use)
- **Limit video length** (shorter videos = faster loading)
- **Use appropriate quality** (not all images need ultra-high resolution)

## Supported File Types

### Images
- JPEG/JPG
- PNG
- GIF
- WebP
- SVG
- BMP
- ICO

### Videos
- MP4
- WebM
- MOV
- AVI
- MKV

### Audio
- MP3
- OGG
- WAV
- M4A
- AAC

### Documents
- PDF
- DOC/DOCX
- TXT
- RTF
- ODT

## UI Components

### File Grid
- **Responsive layout** - Adapts to panel width
- **File previews** - Image thumbnails or type icons
- **Hover effects** - Action buttons appear on hover
- **Click to insert** - Single click adds file to canvas

### Upload Section
- **File selection button** - Opens file browser
- **Multiple file support** - Upload many files at once
- **Progress tracking** - Real-time upload progress bar
- **Selected files list** - Review before uploading

### Tabs
- **All** - Show all file types
- **Images** - Filter to images only
- **Videos** - Filter to videos only
- **Documents** - Filter to documents only

### Search Bar
- **Real-time filtering** - Results update as you type
- **Name-based search** - Searches file names
- **Case-insensitive** - Finds files regardless of capitalization

## Troubleshooting

### "Failed to get file URL"
**Cause:** Supabase storage bucket not configured or file not found

**Solution:**
1. Check that `user-files` bucket exists in Supabase Storage
2. Verify bucket has proper RLS policies
3. Ensure file.storage_path is correct

### "Upload failed"
**Cause:** File too large, network error, or permissions issue

**Solution:**
1. Check file size (max usually 50MB)
2. Verify network connection
3. Check Supabase Storage quotas
4. Ensure user is authenticated

### Files don't appear in library
**Cause:** Database query filtering them out or not saved to database

**Solution:**
1. Check that file metadata was saved to `files` table
2. Verify `folder_path` matches query
3. Check if file type is being filtered by active tab

### Image previews not loading
**Cause:** Signed URL expired or CORS issue

**Solution:**
1. Refresh library to generate new signed URLs
2. Check Supabase Storage CORS settings
3. Verify bucket is public or has proper RLS policies

## Performance

### Caching
- React Query caches file list for 5 minutes
- Signed URLs cached until expiry (1 hour)
- Refetch triggered after uploads/deletions

### Optimization
- **Lazy image loading** - Images load as needed
- **Pagination** - Consider for libraries with 100+ files
- **Signed URL batching** - Generate URLs on-demand

### Storage Quotas

**Supabase Free Tier:**
- 1 GB storage
- 2 GB bandwidth per month

**Recommendations:**
- Compress images before upload
- Delete unused files regularly
- Monitor storage usage in Supabase dashboard

## Integration with Other Features

### AI Image Generator
- AI-generated images automatically saved to library
- Appear in "Images" tab
- Can be reused across projects

### Web Builder Canvas
- Files inserted as pure HTML elements
- No React dependencies in exported code
- Drag-drop reordering supported via `.canvas-element` wrapper

### Code Editor
- Inserted files appear in HTML code
- Can be edited manually in Code Editor
- Changes sync to preview

## API Reference

### FileLibraryPanel Props

```typescript
interface FileLibraryPanelProps {
  onFileInsert?: (
    fileUrl: string,
    fileName: string,
    mimeType: string
  ) => void;
  onClose?: () => void;
}
```

### FileRecord Type

```typescript
type FileRecord = {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  folder_path: string;
  user_id: string | null;
  is_favorite?: boolean;
  created_at: string;
};
```

### Key Functions

```typescript
// Upload file
uploadFile(file: File): Promise<void>

// Insert file to canvas
handleInsertFile(file: FileRecord): Promise<void>

// Delete file
handleDeleteFile(file: FileRecord, e: React.MouseEvent): Promise<void>

// Toggle favorite
handleToggleFavorite(file: FileRecord, e: React.MouseEvent): Promise<void>
```

## Future Enhancements

**Planned features:**
- [ ] Folder organization
- [ ] Bulk file operations (delete, move, download)
- [ ] File sharing with other users
- [ ] Direct image editing (crop, resize, filters)
- [ ] CDN integration for faster delivery
- [ ] Version history for files
- [ ] File comments and metadata
- [ ] Import from URL
- [ ] Integration with cloud storage (Google Drive, Dropbox)

## Example Workflows

### Workflow 1: Create Hero Section with Image

1. **Open File Library** (`Ctrl+L`)
2. **Upload hero image** or use AI Image Generator
3. **Click image** in library
4. Image inserted with hover effects and caption
5. **Customize** in Code Editor or Properties Panel
6. **Export** final HTML

### Workflow 2: Build Media Gallery

1. **Upload multiple images**
2. **Click each image** to add to canvas
3. Images stack vertically by default
4. **Rearrange** using drag-drop
5. **Style** with custom CSS or Tailwind classes

### Workflow 3: Add Video Background

1. **Upload video file** (MP4 recommended)
2. **Click video** in library
3. Video player inserted
4. **Remove controls** via Code Editor for background effect
5. **Add autoplay and loop** attributes

---

**Version**: 1.0.0  
**Last Updated**: November 28, 2025  
**Status**: ✅ Fully Operational
