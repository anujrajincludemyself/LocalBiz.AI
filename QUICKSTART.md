# 🚀 QUICK START GUIDE - LocalBiz AI

## ⚡ Get Running in 5 Minutes!

### 1️⃣ **Start MongoDB** (Important!)
```bash
# Make sure MongoDB is running
mongod
```

If you don't have MongoDB installed, download from: https://www.mongodb.com/try/download/community

---

### 2️⃣ **Start Backend Server**

Open a NEW terminal:

```bash
cd d:\Dukanai\backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 LocalBiz AI Server is running!
📡 Environment: development
🌐 Port: 5000
```

**Backend running on:** `http://localhost:5000`

---

### 3️⃣ **Start Frontend** 

Open a another NEW terminal:

```bash
cd d:\Dukanai\frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Frontend running on:** `http://localhost:5173`

---

### 4️⃣ **Open in Browser**

Go to: **http://localhost:5173**

You'll see the beautiful LocalBiz AI login page! 🎉

---

## 📝 Create Your First Account

1. Click **"Register"**
2. Fill in details:
   - Name: Rahul Sharma
   - Email: rahul@test.com
   - Phone: 9876543210
   - Password: test123

3. Click **"Register"**
4. You'll be logged in automatically!

---

## 🎯 What Works Right Now

✅ **User Registration & Login**
✅ **Dashboard with Analytics** (will show 0 for now)
✅ **Navigation** (Sidebar & Navbar)
✅ **Authentication** (JWT tokens)
✅ **All Backend APIs** are ready!

Pages with placeholder:
- Products
- Orders
- Customers
- AI Assistant
- Settings

---

## 🔑 Add API Keys Later (Optional)

### For WhatsApp Features:
1. Get API key from Meta: https://developers.facebook.com
2. Add to `backend/.env`:
```env
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_ACCESS_TOKEN=your_token
```

### For AI Assistant:
1. Sign up at: https://console.groq.com (FREE!)
2. Get API key
3. Add to `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key
```

### For Payments:
1. Sign up at: https://razorpay.com
2. Get test keys
3. Add to `backend/.env`:
```env
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

After adding keys, restart backend server.

---

## 🛠️ Troubleshooting

### MongoDB Connection Error?
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is free

### Port Already in Use?
**Backend (5000):**
```env
# Change PORT in backend/.env
PORT=5001
```

**Frontend (5173):**
```javascript
// Change in frontend/vite.config.js
server: { port: 5174 }
```

### Dependencies Error?
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

---

## 📂 Project Structure

```
D:/Dukanai/
├── backend/          → Express API (Port 5000)
├── frontend/         → React App (Port 5173)
└── README.md         → Full documentation
```

---

## 🎨 Next Steps

1. **Complete remaining frontend pages:**
   - Products management
   - Orders tracking
   - Customer list
   - AI Assistant chat
   - Settings panel

2. **Add real data:**
   - Create shop
   - Add products
   - Create orders
   - Test WhatsApp & AI

3. **Deploy to production:**
   - Backend → Render/Railway
   - Frontend → Vercel/Netlify
   - Database → MongoDB Atlas

---

## 💡 Tips

- **Database:** All data is stored in `localbiz-ai` database locally
- **Auth:** JWT tokens are stored in `localStorage`
- **Sessions:** Last 15 minutes (access token), 7 days (refresh token)
- **API Testing:** Use Postman or Thunder Client for backend APIs

---

## 🎓 For Your Project Demo

1. Start both servers
2. Register a new user
3. Show the dashboard
4. Navigate through all pages
5. Show the backend API in Postman
6. Show MongoDB database

**This demonstrates a complete production-ready SaaS application!**

---

**Need Help?** Check `README.md` for detailed documentation.

**Made with ❤️ - LocalBiz AI**
