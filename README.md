# CourseMaster Frontend

The modern, responsive frontend for the CourseMaster Learning Management System. Built with Next.js 14, Tailwind CSS, and Lucide React.

## 🚀 Installation & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variable:

```env
# URL of your backend API
# For local development:
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# For production (Vercel):
# NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

> **Important:** When deploying to Vercel, you MUST add `NEXT_PUBLIC_API_URL` in the Vercel Project Settings > Environment Variables. Set it to your **deployed backend URL**.

## 🔗 Backend Repository

The backend code for this project can be found here:
[https://github.com/ana-yet/course-master-server](https://github.com/ana-yet/course-master-server)

## 🧪 Testing Credentials

To test the application features, you can use the following credentials:

### Admin Access
- **Email:** `admin@admin.com`
- **Password:** `admin@admin.com`

### Payment Testing (Stripe)
Use this test card for enrolling in paid courses:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** `123`
- **ZIP:** `10001`

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State/Context:** React Context API
