# 🚀 LocalBiz AI

**AI-Powered Business Assistant for Small Shops in India**

LocalBiz AI is a production-ready SaaS platform that empowers small businesses (kirana stores, tailors, salons, tuition centers, tiffin services, etc.) with digital tools to manage their business, automate WhatsApp messaging, get AI-powered insights, and grow their revenue.

---

## ✨ Features

### 📊 Dashboard
- Real-time sales analytics
- Today's sales with percentage change
- Order tracking
- Customer insights
- Low stock alerts
- Top selling products

### 📦 Product Management
- Add/Edit/Delete products
- Stock management with alerts
- Product categories
- Price and cost tracking
- SKU and barcode support

### 🛒 Order Management
- Create orders manually or via public shop page
- Order status tracking (pending → confirmed → processing → delivered)
- WhatsApp notifications to customers
- Payment status tracking
- Order history

### 👥 Customer Management
- Automatic customer creation from orders
- Customer segmentation (new, regular, VIP, inactive)
- Order history per customer
- Total spent and average order value tracking
- WhatsApp marketing campaigns

### 📱 WhatsApp Integration
- Order confirmation messages (Hindi/English)
- Promotional campaigns
- Customer segmentation for targeting
- Message delivery tracking
- Bulk messaging with rate limiting

### 🤖 AI Assistant
- Business insights powered by Groq AI
- Sales analysis and trends
- Product recommendations
- Marketing suggestions
- Natural language queries in Hindi/English

### 💰 Subscription Plans
- **Free**: 20 orders/month, 50 WhatsApp messages, 10 AI queries
- **Basic (₹199)**: 100 orders, 500 messages, 50 AI queries
- **Pro (₹499)**: Unlimited orders, 2000 messages, 200 AI queries
- **Enterprise (₹999)**: Everything unlimited + API access

### 🌐 Public Shop Page
- Each shop gets a unique URL: `localbiz.ai/shop/{shop-name}`
- Product catalog display
- WhatsApp order button
- Mobile-responsive
- SEO optimized

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Axios** - HTTP requests
- **Razorpay** - Payment processing
- **Nodemailer** - Email notifications

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Chart.js** - Analytics charts
- **Axios** - API calls
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Integrations
- **Groq AI** - Business intelligence (free tier: 14,400 requests/day)
- **Meta WhatsApp Cloud API** - Messaging
- **Razorpay** - Payments

---

## 📁 Project Structure

```
LocalBiz AI/
├── backend/
│   ├── config/           # Database connection
│   ├── middleware/       # Auth, error handling, plan limits
│   ├── models/           # Mongoose schemas (7 models)
│   ├── routes/           # API endpoints (8 route files)
│   ├── services/         # WhatsApp, AI, Email services
│   ├── utils/            # Validators, helpers
│   ├── server.js         # Express app
│   ├── package.json
│   └── .env              # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components
    │   ├── context/      # React Context (Auth)
    │   ├── hooks/        # Custom hooks
    │   ├── services/     # API service (Axios)
    │   ├── utils/        # Helper functions
    │   ├── App.jsx       # Main app component
    │   ├── main.jsx      # Entry point
    │   └── index.css     # Tailwind + custom styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/localbiz-ai.git
cd localbiz-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables:**
Create `.env` file in `backend/` directory (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/localbiz-ai

JWT_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here

FRONTEND_URL=http://localhost:5173

# Optional: Add later
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
GROQ_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Start MongoDB:**
```bash
# If using local MongoDB
mongod
```

**Start Backend Server:**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Start Frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔑 Setting Up Integrations

### Groq AI (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for free
3. Create API key
4. Add to `.env`: `GROQ_API_KEY=your_key`

Free tier: **14,400 requests/day** (more than enough!)

### WhatsApp Cloud API (Free)
1. Create Facebook Business Account
2. Go to [developers.facebook.com](https://developers.facebook.com)
3. Create an app → Add WhatsApp product
4. Get Phone Number ID and Access Token
5. Add to `.env`:
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_token
```

Free tier available for testing.

### Razorpay (Optional)
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get test API keys
3. Add to `.env`:
```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
```

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Shop
- `POST /api/shop` - Create shop
- `GET /api/shop` - Get user's shop
- `PUT /api/shop` - Update shop
- `GET /api/shop/public/:slug` - Get public shop page

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/alerts/low-stock` - Get low stock items

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/send-whatsapp` - Send WhatsApp confirmation

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/sales-trends` - Get sales trends

### WhatsApp
- `POST /api/whatsapp/send` - Send single message
- `POST /api/whatsapp/campaign` - Send bulk campaign
- `GET /api/whatsapp/messages` - Get message history

### AI
- `POST /api/ai/query` - Ask AI for insights
- `GET /api/ai/suggestions` - Get suggested questions

### Payments
- `GET /api/payments/plans` - Get subscription plans
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

---

## 🎨 Design Features

- **Glassmorphism** UI with backdrop blur effects
- **Gradient backgrounds** for premium feel
- **Smooth animations** on page load and interactions
- **Micro-animations** on hover and click
- **Dark mode ready** color palette
- **Hindi/English** font support (Noto Sans Devanagari)
- **Mobile responsive** design
- **SEO optimized** meta tags

---

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with express-validator
- Helmet.js for HTTP headers
- XSS protection

---

## 📊 Database Schema

### User
```javascript
{
  name, email, password, phone, shopId,
  plan, planExpiry, planLimits, usage,
  isVerified, isActive, refreshToken
}
```

### Shop
```javascript
{
  shopName, owner, category, whatsapp, email,
  address, publicSlug, logo, description,
  isActive, settings, businessHours, stats
}
```

### Product
```javascript
{
  shopId, name, description, price, stock, unit,
  category, image, sku, barcode, costPrice,
  isActive, isFeatured, tags, stats
}
```

### Order
```javascript
{
  shopId, orderNumber, customer, items[],
  total, discount, finalTotal, status,
  paymentStatus, paymentMethod, paidAmount,
  deliveryDate, notes, whatsappSent, source
}
```

### Customer
```javascript
{
  shopId, name, phone, email, address,
  totalOrders, totalSpent, lastOrderDate,
  averageOrderValue, tags, segment
}
```

### Payment
```javascript
{
  userId, razorpayOrderId, razorpayPaymentId,
  plan, amount, currency, status,
  validFrom, validUntil
}
```

### Message
```javascript
{
  shopId, type, recipient, message,
  status, whatsappMessageId, orderId,
  campaignId, sentAt, deliveredAt
}
```

---

**Perfect for final year project submission!**
