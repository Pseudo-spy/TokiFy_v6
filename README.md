# 🚀 TokiFy v6

A Web3-powered fintech platform enabling secure cross-border remittances, identity verification, and seamless payment processing.

<div align="center">
  <img src="Screenshot%202026-03-03%20133142.png" width="1200" alt="WheelRank Banner"/>
</div>

---

## 🌐 Overview

TokiFy v6 simplifies global money transfers by combining modern Web3 concepts with traditional fintech infrastructure. It ensures secure transactions, smooth user experience, and scalable architecture using Supabase and Razorpay.

---

## ✨ Features

- 🔐 Secure Authentication (Supabase)
- 💳 Razorpay Payment Integration
- 🌍 Cross-border Remittance Flow
- 📊 Interactive Dashboard
- ⚡ Real-time Data Handling
- 🎨 Smooth UI with GSAP Animations
- 🧩 Scalable & Modular Architecture

---

## 🛠️ Tech Stack

**Frontend**
- Vite + React
- Tailwind CSS
- GSAP

**Backend & Services**
- Supabase (Auth, Database, Edge Functions)
- Razorpay API

**Deployment**
- Vercel (Frontend)
- Supabase (Backend)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY=your_razorpay_key


---

## 🚀 Getting Started

### 1. Clone the Repository
git clone https://github.com/Pseudo-spy/TokiFy_v6.git

cd TokiFy_v6


### 2. Install Dependencies
npm install


### 3. Run Development Server
npm run dev


### 4. Build for Production
npm run build

---

## 🌍 Deployment (Vercel)

- Import the GitHub repo into Vercel
- Set:
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- Add environment variables in Vercel dashboard

---

## 🔌 Supabase Functions

Deploy required functions:
supabase functions deploy aadhar-otp-generate
supabase functions deploy aadhar-face-match
supabase functions deploy create-razorpay-order
supabase functions deploy verify-payment


---

## 💡 Architecture

Frontend (Vercel)  
↓  
Supabase (Auth + DB + Edge Functions)  
↓  
Razorpay (Payments)

---

## ⚠️ Common Issues

- Build fails → Check environment variables
- API errors → Verify Supabase URL & keys
- Payment issues → Check Razorpay keys
- Import errors → Fix file paths / aliases

---

## 📌 Future Improvements

- Blockchain-based transaction logs
- AI chatbot integration
- Multi-currency support
- Mobile optimization

---

## 👨‍💻 Author

**Abhisek Amin**  
Full Stack Developer | Web3 & AI Enthusiast

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!




