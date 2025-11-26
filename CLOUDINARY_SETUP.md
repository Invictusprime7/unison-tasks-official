# Cloudinary Background Removal Setup

This project uses Cloudinary for AI-powered background removal instead of client-side ML models (reduces bundle size by ~5MB).

## Quick Setup (5 minutes)

### 1. Your Cloudinary Account
- **Cloud Name**: `dt6os30cx` ✅ (already configured)
- Dashboard: https://console.cloudinary.com/

### 2. Create Unsigned Upload Preset

**Steps:**
1. Go to: https://console.cloudinary.com/settings/upload
2. Click "Add upload preset" button
3. Configure:

```yaml
Signing Mode: Unsigned ⚠️ (IMPORTANT)
Preset name: web_builder_uploads
Folder: web-builder (optional)

Allowed formats: jpg, jpeg, png, webp, gif
Max file size: 10 MB
Max dimensions: 4096 x 4096

Access mode: public
Resource type: image

Media Analysis: ✅ Enabled (required for AI features)
```

4. Click "Save"

### 3. Enable Background Removal AI

1. Go to: https://console.cloudinary.com/addons
2. Find "Cloudinary AI Background Removal"
3. Click "Enable" (included in free tier)

### 4. Environment Variables

Already configured in `.env` and `.env.development`:

```bash
VITE_CLOUDINARY_CLOUD_NAME=dt6os30cx
VITE_CLOUDINARY_UPLOAD_PRESET=web_builder_uploads
```

### 5. Test It

1. Restart dev server:
   ```bash
   npm run dev
   ```

2. Go to Web Builder → Image Operations Panel
3. Upload an image and click "Remove Background"
4. Check browser console for upload logs

## How It Works

1. **Client**: Resizes image if needed (max 1024px)
2. **Upload**: Sends to Cloudinary via unsigned upload
3. **Transform**: Requests `e_background_removal` transformation
4. **Download**: Returns processed image as Blob

**Code location**: `src/utils/imageOperations.ts`

## Pricing (Free Tier)

Cloudinary Free Tier includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25 credits/month
- ✅ Background removal: ~0.5 credits/image
- **= ~50 background removals/month FREE**

After free tier: $0.25-0.50 per image

## Security Notes

⚠️ **Unsigned uploads** mean anyone with your preset name can upload. To secure:

### Option 1: Cloudinary Controls (Current Setup)
- Set `Max file size: 10MB`
- Set `Allowed formats: jpg, jpeg, png, webp, gif`
- Set `Max dimensions: 4096x4096`
- Enable upload moderation if needed

### Option 2: Signed Uploads (Production Recommended)
Implement server-side signing via Supabase Edge Function:
- API key/secret never exposed to client
- Full upload validation control
- Better security for production

## Troubleshooting

### Error: "Cloudinary configuration missing"
- Check `.env` has both variables
- Restart dev server after adding env vars

### Error: "Upload failed: 400/401"
- Verify cloud name is correct: `dt6os30cx`
- Verify upload preset exists and is **unsigned**
- Check preset name matches: `web_builder_uploads`

### Error: "Transformation failed"
- Verify Background Removal AI is enabled in Cloudinary dashboard
- Check you have credits remaining (free tier: 25/month)
- Wait a few seconds - first transformation can be slow

### Upload works but transformation fails
- Background removal requires `Media Analysis` to be enabled
- Go to upload preset settings → Enable "Media Analysis & AI"

## Next Steps (Optional)

- [ ] Implement server-side signed uploads for production
- [ ] Add upload progress UI in ImageOperationsPanel
- [ ] Use Cloudinary's `eager` parameter for faster processing
- [ ] Add Cloudinary CDN for serving all images (optimization + delivery)

## Resources

- Cloudinary Dashboard: https://console.cloudinary.com/
- Background Removal Docs: https://cloudinary.com/documentation/background_removal_addon
- Upload API Reference: https://cloudinary.com/documentation/image_upload_api_reference
