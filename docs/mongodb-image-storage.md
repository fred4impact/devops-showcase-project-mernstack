# MongoDB Image Storage for Local Development

## Overview

For local development and testing, the application now uses MongoDB to store images instead of AWS S3. This eliminates the need for S3 credentials during development while maintaining the same API interface.

## How It Works

### Automatic Detection
The system automatically detects whether to use S3 or MongoDB based on:
- **S3 Credentials**: If `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_BUCKET` are configured
- **Environment**: In development mode, MongoDB is preferred even if S3 credentials exist

### Storage Strategy
- **Production**: Uses AWS S3 for scalable, cloud-based storage
- **Development**: Uses MongoDB with GridFS-like storage for local testing

## Database Schema

### Image Collection
```typescript
{
  _id: ObjectId,
  filename: string,        // Generated filename
  originalName: string,    // Original uploaded filename
  mimetype: string,        // MIME type (image/jpeg, image/png, etc.)
  size: number,           // File size in bytes
  data: Buffer,           // Binary image data
  eventId: string,        // Associated event ID
  isDeleted: boolean,     // Soft delete flag
  createdAt: Date,        // Upload timestamp
  updatedAt: Date         // Last modification timestamp
}
```

## API Endpoints

### Upload Image
```
POST /events/:id/upload-image
Content-Type: multipart/form-data

Form Data:
- image: File (required)
```

**Response:**
```json
{
  "imageUrl": "/api/images/64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Get Image
```
GET /events/images/:imageId
```

**Response:**
- Content-Type: image/jpeg (or appropriate MIME type)
- Binary image data

## Configuration

### Environment Variables
For local development, you can leave S3 variables empty or unset:

```env
# Optional - leave empty for MongoDB storage
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
S3_REGION=us-east-1

# Required for MongoDB
MONGO_URI=mongodb://localhost:27017/ticketnow
```

### Switching to S3
To use S3 in production, simply set the S3 environment variables:

```env
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET=your_bucket_name
S3_REGION=us-east-1
```

## Usage Examples

### Frontend Upload
```typescript
// Upload image after creating event
const formData = new FormData();
formData.append('image', selectedImage);

const response = await eventsApi.uploadEventImage(eventId, formData);
console.log('Image URL:', response.data.imageUrl);
```

### Display Image
```jsx
// Display uploaded image
<img 
  src={`http://localhost:3000/api/images/${imageId}`} 
  alt="Event image" 
/>
```

## Benefits

### Development
- ✅ No AWS credentials needed
- ✅ No external dependencies
- ✅ Fast local testing
- ✅ Easy debugging
- ✅ Consistent with existing MongoDB setup

### Production Ready
- ✅ Automatic S3 fallback
- ✅ Same API interface
- ✅ Easy migration path
- ✅ Scalable storage options

## File Size Limits

### MongoDB
- **Default**: 16MB per document (MongoDB limit)
- **Recommended**: < 5MB for optimal performance
- **Large Files**: Consider GridFS for files > 16MB

### S3
- **No practical limit** for file sizes
- **Recommended**: < 100MB for web applications

## Performance Considerations

### MongoDB Storage
- **Pros**: Fast local access, no network latency
- **Cons**: Limited by MongoDB document size, not suitable for large files
- **Best For**: Development, testing, small images (< 5MB)

### S3 Storage
- **Pros**: Unlimited file sizes, CDN integration, global distribution
- **Cons**: Network latency, external dependency
- **Best For**: Production, large files, high traffic

## Migration Guide

### From MongoDB to S3
1. Set S3 environment variables
2. Restart the application
3. Existing MongoDB images remain accessible
4. New uploads will use S3

### From S3 to MongoDB
1. Clear S3 environment variables
2. Restart the application
3. Existing S3 images remain accessible via S3 URLs
4. New uploads will use MongoDB

## Troubleshooting

### Common Issues

#### 1. Image Not Displaying
```bash
# Check if image exists in database
db.images.findOne({_id: ObjectId("imageId")})

# Check if image endpoint is working
curl http://localhost:3000/api/images/imageId
```

#### 2. Upload Failures
```bash
# Check MongoDB connection
mongosh ticketnow --eval "db.images.countDocuments()"

# Check file size limits
# MongoDB has 16MB document limit
```

#### 3. Performance Issues
```bash
# Check database size
db.stats()

# Check image collection size
db.images.stats()
```

### Debug Commands

```bash
# List all images
db.images.find({}, {filename: 1, size: 1, eventId: 1})

# Find images for specific event
db.images.find({eventId: "eventId"})

# Check storage usage
db.images.aggregate([
  {$group: {_id: null, totalSize: {$sum: "$size"}}}
])
```

## Best Practices

### Development
- Use MongoDB for local testing
- Keep images under 5MB
- Test with various image formats
- Monitor database size

### Production
- Use S3 for production deployments
- Implement image optimization
- Use CDN for global distribution
- Monitor storage costs

### Security
- Validate file types
- Implement file size limits
- Sanitize filenames
- Use proper MIME types

## Monitoring

### Database Metrics
```javascript
// Check image storage usage
db.images.aggregate([
  {
    $group: {
      _id: null,
      totalImages: {$sum: 1},
      totalSize: {$sum: "$size"},
      averageSize: {$avg: "$size"}
    }
  }
])
```

### Application Metrics
- Upload success rate
- Image load times
- Storage usage trends
- Error rates

This MongoDB-based image storage solution provides a seamless development experience while maintaining production-ready architecture.
