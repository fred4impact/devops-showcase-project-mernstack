# Image Upload Troubleshooting Guide

## 🐛 **Issues Fixed**

### 1. **Route Order Problem** ✅ FIXED
**Issue**: `Cast to ObjectId failed for value "arts-exhibition"`  
**Cause**: The `@Get(':id')` route was catching slugs before `@Get('slug/:slug')` could handle them  
**Solution**: Reordered routes so slug route comes first

### 2. **API Base URL Mismatch** ✅ FIXED
**Issue**: Frontend trying to connect to wrong port  
**Cause**: Frontend API base URL was set to port 3000, but backend runs on port 3001  
**Solution**: Updated frontend API base URL to port 3001

### 3. **Image URL Construction** ✅ FIXED
**Issue**: Image URLs not properly constructed for MongoDB storage  
**Cause**: Image URLs were relative paths instead of full URLs  
**Solution**: Updated S3Service to return full URLs with correct backend port

## 🔧 **Changes Made**

### Backend Changes
1. **Route Order Fix** (`events.controller.ts`):
   ```typescript
   // BEFORE (causing issues)
   @Get(':id')           // This caught slugs first
   @Get('slug/:slug')    // This never got reached
   
   // AFTER (fixed)
   @Get('slug/:slug')    // Specific route first
   @Get(':id')           // Generic route second
   ```

2. **Image URL Construction** (`s3.service.ts`):
   ```typescript
   // BEFORE
   return `/api/images/${image._id}`;
   
   // AFTER
   return `${this.configService.get('BACKEND_BASE_URL', 'http://localhost:3001')}/events/images/${image._id}`;
   ```

3. **Image Serving Endpoint** (`events.controller.ts`):
   ```typescript
   @Get('images/:imageId')
   async getImage(@Param('imageId') imageId: string, @Res() res) {
     // Added proper caching headers
     res.set({
       'Content-Type': image.mimetype,
       'Content-Length': image.size,
       'Cache-Control': 'public, max-age=31536000',
     });
   }
   ```

### Frontend Changes
1. **API Base URL Fix** (`api.ts`):
   ```typescript
   // BEFORE
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
   
   // AFTER
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
   ```

## 🧪 **Testing the Fix**

### 1. **Test Event Creation with Image**
```bash
# 1. Start backend
cd application/backend
npm run start:dev

# 2. Start frontend
cd application/frontend
npm run dev

# 3. Create event with image
# - Go to http://localhost:3000/events/create
# - Fill in event details
# - Upload an image
# - Click "Create Event"
```

### 2. **Test Image Display**
```bash
# 1. View the created event
# - Go to events list
# - Click on your event
# - Check if image displays correctly

# 2. Check browser network tab
# - Look for image requests to http://localhost:3001/events/images/{imageId}
# - Should return 200 status with image data
```

### 3. **Test API Endpoints**
```bash
# Test slug route
curl http://localhost:3001/events/slug/arts-exhibition

# Test image endpoint
curl http://localhost:3001/events/images/{imageId}
```

## 🔍 **Debugging Steps**

### 1. **Check Backend Logs**
```bash
# Look for these error patterns:
# ❌ "Cast to ObjectId failed for value"
# ❌ "Event not found"
# ❌ "Image not found"

# ✅ Should see:
# ✅ "Event retrieved successfully"
# ✅ "Image uploaded successfully"
```

### 2. **Check Frontend Network Tab**
```bash
# Look for these requests:
# ✅ GET /events/slug/arts-exhibition (200)
# ✅ GET /events/images/{imageId} (200)
# ❌ GET /events/arts-exhibition (404) - This was the problem
```

### 3. **Check Database**
```bash
# Connect to MongoDB
mongosh ticketnow

# Check if image was saved
db.images.find({eventId: "your-event-id"})

# Check if event has image URL
db.events.findOne({slug: "arts-exhibition"})
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "Event not found" when viewing by slug
**Cause**: Route order problem  
**Solution**: ✅ Fixed - slug route now comes first

### Issue 2: Image placeholder shows but no image
**Cause**: Wrong API base URL or image URL construction  
**Solution**: ✅ Fixed - API base URL corrected to port 3001

### Issue 3: "Image not found" error
**Cause**: Image not saved to database or wrong image ID  
**Solution**: Check MongoDB images collection

### Issue 4: CORS errors
**Cause**: Frontend trying to load images from different port  
**Solution**: ✅ Fixed - images now served from correct backend port

## 📊 **Expected Behavior**

### ✅ **Working Flow**
1. **Create Event**: Upload image → Image saved to MongoDB → Event created with image URL
2. **View Event**: Frontend requests event by slug → Backend returns event with image URL
3. **Display Image**: Frontend requests image → Backend serves image from MongoDB
4. **Result**: Image displays correctly in event card and detail page

### 🔄 **Image URL Format**
```
# MongoDB Storage
http://localhost:3001/events/images/{imageId}

# Example
http://localhost:3001/events/images/64f8a1b2c3d4e5f6a7b8c9d0
```

## 🛠 **Manual Testing Commands**

### Test Backend Endpoints
```bash
# Test event by slug
curl -X GET "http://localhost:3001/events/slug/arts-exhibition" \
  -H "Content-Type: application/json"

# Test image endpoint
curl -X GET "http://localhost:3001/events/images/{imageId}" \
  -H "Content-Type: image/jpeg"
```

### Test Frontend API Calls
```bash
# Check browser console for API calls
# Should see successful requests to:
# - /events/slug/arts-exhibition
# - /events/images/{imageId}
```

## 🎯 **Verification Checklist**

- [ ] Backend starts without errors
- [ ] Frontend connects to correct backend port (3001)
- [ ] Event creation with image works
- [ ] Event displays with correct image
- [ ] No "Cast to ObjectId" errors in logs
- [ ] Image URLs are full URLs (not relative)
- [ ] Images are served from MongoDB
- [ ] No CORS errors in browser console

## 🚀 **Next Steps**

1. **Restart both services** to apply the fixes
2. **Test event creation** with a new image
3. **Verify image display** in event list and detail pages
4. **Check browser network tab** for successful image requests

The image upload and display should now work correctly! 🎉
