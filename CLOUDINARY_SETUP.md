# Cloudinary Image Upload Setup Guide

## Step 1: Complete Your .env File

Your Cloudinary URL: `cloudinary://<your_api_key>:<your_api_secret>@doike6ngk`

1. Go to your `.env` file in the backend folder
2. Find these lines:
```
CLOUDINARY_CLOUD_NAME=doike6ngk
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

3. Replace:
   - `<your_api_key>` with your actual API key
   - `<your_api_secret>` with your actual API secret

**Example:**
```
CLOUDINARY_CLOUD_NAME=doike6ngk
CLOUDINARY_API_KEY=123456789abcdef
CLOUDINARY_API_SECRET=xyz987654321abc
```

---

## Step 2: Install Required Backend Packages

Run these commands in the backend folder:

```bash
# Install Cloudinary package for image uploads
npm install cloudinary

# Install Multer for handling file uploads
npm install multer
```

---

## Step 3: Backend Structure

✅ New files created:

1. **config/cloudinary.js** - Cloudinary configuration
2. **controllers/uploadController.js** - Upload logic
3. **routes/uploadRoutes.js** - Upload API endpoints
4. **server.js** - Updated with upload routes

---

## Step 4: API Endpoints Available

### Upload Post Image
- **URL:** `POST /api/upload/post`
- **Authentication:** Required (JWT token)
- **File Field:** `image` (single file, max 5MB)
- **Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://cloudinary.com/...",
  "publicId": "campus-connect/posts/..."
}
```

### Upload Profile Image
- **URL:** `POST /api/upload/profile`
- **Authentication:** Required (JWT token)
- **File Field:** `image` (single file, max 5MB)
- **Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://cloudinary.com/...",
  "publicId": "campus-connect/profiles/..."
}
```

---

## Step 5: Frontend Integration

You'll need to update:
1. **Profile.jsx** - Upload profile image
2. **Feed.jsx** - Upload post images
3. Create FormData for file uploads

**Example Frontend Code:**
```javascript
const uploadImage = async (file) => {
  // Create FormData object to send file
  const formData = new FormData()
  formData.append('image', file)

  // Send to backend API
  const response = await fetch('/api/upload/post', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  const data = await response.json()
  return data.imageUrl // Get image URL from response
}
```

---

## Step 6: Test the Upload

1. Start backend server:
```bash
cd backend
node server.js
```

2. Create a simple test request with image file
3. Check Cloudinary dashboard to see uploaded images

---

## File Structure

```
backend/
├── config/
│   ├── db.js
│   └── cloudinary.js          ✨ NEW
├── controllers/
│   ├── authController.js
│   └── uploadController.js    ✨ NEW
├── routes/
│   ├── authRoutes.js
│   └── uploadRoutes.js        ✨ NEW
├── middleware/
│   └── authenticateToken.js
├── .env                        (UPDATED with Cloudinary creds)
├── server.js                   (UPDATED with upload routes)
└── package.json
```

---

## Troubleshooting

**Error: "No file uploaded"**
- Make sure file field name is `image` in frontend form

**Error: "Only image files are allowed"**
- File must be actual image (jpg, png, gif, etc)
- Not text or other file types

**Error: "Cloudinary authentication failed"**
- Check .env file has correct API credentials
- Reload server after .env changes

**Image not appearing in Cloudinary dashboard**
- Check file was successfully uploaded (200 response)
- Check image URL is accessible

---

## Next Steps

Ready for frontend integration? Let me know and I'll create:
1. ✅ Frontend image upload in Profile page
2. ✅ Frontend image upload in Feed for posts
3. ✅ Display uploaded images properly
4. ✅ Persist image URLs in localStorage

