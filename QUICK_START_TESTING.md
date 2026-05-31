# Quick Start - Image Upload Testing

## 🚀 Ready to Test? Follow These Steps:

### Step 1: Install Backend Packages
```bash
cd backend
npm install cloudinary multer
```

### Step 2: Start Backend Server
```bash
cd backend
node server.js
```
Expected output:
```
✅ Server started on port 8000
```

### Step 3: Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

### Step 4: Test Profile Image Upload

1. Open browser → Campus Connect app
2. Login with your credentials
3. Click **Profile** in navigation
4. Click **"✎ Edit Profile"** button
5. Hover over your avatar (big circle with initials)
6. Click the **📷** camera icon
7. Select an image file (JPG, PNG, etc)
8. Wait for: **"⏳ Uploading images to cloud..."**
9. See: **"Profile image uploaded successfully!"**
10. See: Image preview appears in the avatar
11. Click **"💾 Save Changes"**
12. Refresh page → Image still there! ✅

### Step 5: Test Post Image Upload

1. Still on Profile page
2. Scroll down to "Create a New Post"
3. Write some text in textarea
4. Click **"📷 Upload Images"**
5. Select 1 or more images
6. See thumbnails appear with X buttons
7. Click **"✓ Post"**
8. Post appears with images!

### Step 6: Verify Images in Cloudinary

1. Go to https://cloudinary.com/console
2. Click **"Media Library"** (left menu)
3. You should see uploaded images in folders:
   - `campus-connect/profiles/` → Profile pictures
   - `campus-connect/posts/` → Post images

---

## 📊 What Gets Uploaded Where

| Type | Folder | Triggered By |
|------|--------|--------------|
| Profile Image | campus-connect/profiles/ | Edit Profile → Upload Image |
| Post Image | campus-connect/posts/ | Create Post → Upload Images |

---

## 💾 Where Data is Stored

| Data | Storage | Persistence |
|------|---------|-------------|
| Image Files | Cloudinary Cloud | Permanent (cloud storage) |
| Image URLs | localStorage | Until browser cache cleared |
| Post+Images | localStorage | Until browser cache cleared |

---

## ✅ Expected Results

| Action | Expected Result |
|--------|-----------------|
| Upload profile image | Avatar shows uploaded image, "Profile image uploaded successfully!" |
| Upload post images | Images display in thumbnails, can be removed with X button |
| Click Post | New post appears at top with text + images |
| Logout & Login | Posts still there, Images still visible |
| Refresh Page | Everything persists |

---

## 🔗 API Endpoints Being Used

```
Backend:
POST /api/upload/profile  ← Profile image upload
POST /api/upload/post     ← Post image upload

Both require JWT token in header:
Authorization: Bearer {token}
```

---

## 🎯 Key Features in Code

**Frontend (Profile.jsx):**
- ✅ `handleProfileImageUpload()` - Uploads profile pic to Cloudinary
- ✅ `handleImageUpload()` - Uploads post images to Cloudinary  
- ✅ `setProfileImageUrl()` - Stores Cloudinary URL
- ✅ `setPostImageUrls()` - Stores multiple Cloudinary URLs
- ✅ `isUploading` state - Shows upload progress
- ✅ Error handling - Shows error messages

**Backend (uploadRoutes.js):**
- ✅ `/api/upload/profile` - Profile image endpoint
- ✅ `/api/upload/post` - Post image endpoint
- ✅ Authentication required - JWT token validation
- ✅ File validation - Only images accepted
- ✅ Size limit - Max 5MB

---

## 🐛 If Something Doesn't Work

| Problem | Solution |
|---------|----------|
| "Cannot find module cloudinary" | Run: `npm install cloudinary multer` in backend |
| Images don't upload | Check backend console for errors |
| "No file uploaded" | Make sure actual file is selected |
| Image not showing | Refresh page, check localStorage |
| 401 Unauthorized | Make sure you're logged in (have valid token) |

---

## 📱 Mobile Testing

The upload feature works on mobile too:
- Touch camera icon to upload
- Takes picture from phone camera or gallery
- Uploads same way as desktop

---

## 🎉 You're All Set!

Your Campus Connect now has:
- ✅ Cloud image storage (Cloudinary)
- ✅ Profile image upload
- ✅ Post image upload  
- ✅ Persistent image storage
- ✅ Complete error handling

Ready to test! Let me know if you hit any issues. 🚀

