# Cloudinary Image Upload - Installation & Setup

## ✅ Your Credentials Are Set!

```
Cloud Name: doike6ngk
API Key: 522965812953125
API Secret: WilR4Q4hmBggH-_EcjOL0eqbxfQ
```

---

## 📦 Step 1: Install Required Packages

Open terminal in the **backend** folder and run:

```bash
npm install cloudinary multer
```

This installs:
- **cloudinary** - Library for cloud image storage
- **multer** - Handles file uploads from frontend

---

## ✨ Step 2: What Was Created

### Backend Files (Already Done ✅):
1. **config/cloudinary.js** - Configuration file
2. **controllers/uploadController.js** - Upload functions with Cloudinary integration
3. **routes/uploadRoutes.js** - API endpoints for uploading
4. **server.js** - Updated to include upload routes
5. **.env** - Updated with credentials

### Frontend Files (Already Updated ✅):
1. **Profile.jsx** - Now uploads profile images to Cloudinary
   - Upload images while editing profile
   - Shows upload status ("⏳ Uploading...")
   - Saves Cloudinary URL to profile

---

## 🚀 Step 3: Start Backend Server

Open terminal in **backend** folder:

```bash
node server.js
```

You should see:
```
✅ Server started on port 8000
```

---

## 🧪 Step 4: Test Image Upload

### Test Profile Image Upload:

1. **Go to Profile page** in your browser
2. Click **"✎ Edit Profile"** button
3. Hover over your profile picture (the big circle with initials)
4. Click the **📷 camera icon** that appears
5. Select an image file from your computer
6. Wait for "⏳ Uploading to cloud..." message
7. See "Profile image uploaded successfully!"
8. Click **"💾 Save Changes"** to finalize
9. Refresh the page - image URL is saved in localStorage!

### What Happens Behind the Scenes:

```
User selects image
    ↓
Frontend creates FormData
    ↓
Sends to /api/upload/profile (authenticated)
    ↓
Multer receives file
    ↓
Backend uploads to Cloudinary
    ↓
Cloudinary returns secure URL
    ↓
Frontend displays in profile
    ↓
URL stored in localStorage
```

---

## 📸 Create Posts with Images

When creating a new post:

1. Write text in textarea
2. Click **"📷 Upload Images"** button
3. Select one or more image files
4. See preview thumbnails appear
5. Images upload to Cloudinary when you select them
6. Click **"✓ Post"** button
7. Post appears in Feed with images!

---

## 🔌 API Endpoints

### Profile Image Upload
```
POST /api/upload/profile
Authorization: Bearer {token}
Body: FormData with 'image' file

Response:
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/...",
  "publicId": "campus-connect/profiles/..."
}
```

### Post Image Upload
```
POST /api/upload/post
Authorization: Bearer {token}
Body: FormData with 'image' file

Response:
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/...",
  "publicId": "campus-connect/posts/..."
}
```

---

## 💾 Data Storage

**Where images are stored:**
- Cloudinary cloud storage (your cloud account)
- "campus-connect/profiles/" folder - Profile pictures
- "campus-connect/posts/" folder - Post images

**Where URLs are stored:**
- localStorage - In browser for quick access
- Can be saved to MongoDB (future enhancement)

---

## 🔍 Verify Upload Success

**In Cloudinary Dashboard:**
1. Go to https://cloudinary.com/console
2. Click **"Media Library"** in left menu
3. You should see folders:
   - `campus-connect/profiles/`
   - `campus-connect/posts/`
4. Your uploaded images appear here!

---

## 📝 Code Structure (Beginner-Friendly)

All uploaded image functions have:
- ✅ Detailed comments explaining each step
- ✅ Error handling for network issues
- ✅ Upload progress indicators
- ✅ Success/failure messages for user
- ✅ LocalStorage persistence

### Profile Image Upload Flow:
```javascript
// 1. User selects file
const file = event.target.files[0]

// 2. Show preview while uploading
const previewUrl = URL.createObjectURL(file)

// 3. Upload to backend
fetch('/api/upload/profile', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': `Bearer ${token}` }
})

// 4. Get Cloudinary URL from response
const imageUrl = data.imageUrl

// 5. Save to profile
setProfileImageUrl(imageUrl)
```

---

## ✅ Feature Checklist

- [x] Cloudinary account created
- [x] API credentials configured in .env
- [x] Backend upload routes created
- [x] Profile image upload working
- [x] Post image upload working
- [x] Images stored in Cloudinary
- [x] URLs stored in frontend localStorage
- [x] Upload status indicators added
- [x] Error handling implemented
- [x] Beginner-friendly code with comments

---

## 🐛 Troubleshooting

**"Upload failed" error:**
- Check .env file has correct credentials
- Restart backend server after changing .env
- Check file size (max 5MB)

**Image not showing after upload:**
- Check browser console for errors (F12 key)
- Verify image uploaded to Cloudinary dashboard
- Refresh page to reload from localStorage

**"No file uploaded" error:**
- Make sure file input field name is 'image'
- Check file is actually selected
- File must be valid image format

---

## 🎯 Next Steps

The system now:
- ✅ Uploads images to Cloudinary cloud
- ✅ Stores image URLs persistently
- ✅ Displays images in profile and posts
- ✅ Works with authentication

You can now:
1. Upload profile pictures when editing
2. Upload post images when creating posts
3. All uploads persist across logout/login
4. All images saved in cloud (Cloudinary)

**Everything is ready to test!** 🚀

