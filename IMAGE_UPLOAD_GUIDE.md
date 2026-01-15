# 📤 Image Upload - Quick Guide

## ✅ What I Just Added

I've created the **image upload functionality** for products (and it can be used for other features too):

1. ✅ **Upload route**: `/api/upload/product-image`
2. ✅ **Multer middleware**: Handles file uploads
3. ✅ **File validation**: Only allows images (jpg, png, gif, webp)
4. ✅ **Size limit**: 5MB max
5. ✅ **Uploads folder**: Created at `d:\Dukanai\backend\uploads`
6. ✅ **Static file serving**: Images accessible at `http://localhost:5000/uploads/filename`

---

## 🔄 RESTART Backend Server

**In your backend terminal:**

1. Press **`Ctrl+C`**
2. Run: **`node server.js`**

---

## 📱 How to Use Image Upload

### From Frontend (Example for Products page):

```jsx
// In frontend - example usage
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await api.post('/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const imageUrl = response.data.imageUrl; // e.g., "/uploads/product-1234567890.jpg"
    console.log('Image uploaded:', imageUrl);
    
    // Use this URL when creating/updating product
    return imageUrl;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### With Postman/API Testing:

```http
POST http://localhost:5000/api/upload/product-image
Content-Type: multipart/form-data

Form Data:
- image: [select file]
```

---

## 📂 Where Images are Stored

- **Backend**: `d:\Dukanai\backend\uploads/`
- **URL**: `http://localhost:5000/uploads/product-xxxxx.jpg`
- **Naming**: `product-[timestamp]-[random].jpg`

---

## 🖼️ Add to Products Page

Need me to **add an image upload field to the Products page**? Let me know and I can:

1. Add file input to product form
2. Handle image upload on submit
3. Display product images
4. Allow image editing

---

## 🔍 What are you trying to upload?

Please tell me:
1. **What type of file?** (Product image? Logo? Something else?)
2. **From which page?** (Products? Settings? Custom location?)
3. **What error/issue are you seeing?**

I'll help you implement the frontend form if needed! 🚀
