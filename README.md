# CourseMaster

A production-ready EdTech platform where students can master new skills and instructors can manage their courses.

![Hero Banner](./public/assets/hero.png)

## 🚀 Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Shadcn UI, Framer Motion, Sonner, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Authentication**: JWT-based auth with HttpOnly cookies (simulated via local storage for this demo).
- **Validation**: Zod.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/ana-yet/course-master-client.git client
git clone https://github.com/ana-yet/course-master-server.git server
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
MONGO_URI=mongodb://localhost:27017/coursemaster
PORT=5000
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=90d
```
Start the server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd client
npm install
```
Create a `.env.local` file in the `client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```
Start the client:
```bash
npm run dev
```

## 🔑 Key Features

- **Course Management**: Admin can Create, Read, Update, and Delete courses.
- **Enrollment System**: Students can enroll in courses and track their progress.
- **Dashboard**:
  - **Student**: View enrolled courses and progress bars.
  - **Admin**: Manage courses and view enrollment analytics (Bar Chart).
- **Search & Filter**: Real-time search and filtering on the home page.
- **Responsive Design**: Fully optimized for mobile and desktop.

## 🤖 AI Assets
All visual assets (Logo, Hero Banner) were generated using **Nano Banana** (Google's Gemini 3 Pro Image Model).

## 📝 License
MIT
