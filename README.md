# 🐌 SnailMail

SnailMail is a full-stack web application built with **React**, **Node.js**, and **MySQL** that simulates a digital post office system.

---

## 🚀 Tech Stack

**Frontend:** React (Vite)  
**Backend:** Node.js  
**Database:** MySQL  
**Language:** JavaScript (ES Modules)

---

## 📁 Project Structure

```
SnailMail/
├── client/         # Frontend React application
│ ├── src/
│ │ ├── assets/     # Images and static resources
│ │ ├── components/ # Reusable UI elements (buttons, forms, etc.)
│ │ └── pages/      # Main pages and views (e.g., Home, Login, Dashboard)
│ ├── public/
│ └── .env          # Frontend environment variables
│
├── server/         # Backend Node.js application
│ ├── controllers/  # Business logic and SQL query handling
│ ├── routers/      # API route definitions
│ ├── utils/        # Helper and utility functions
│ ├── config/       # MySQL database configuration
│ ├── server.js     # Entry point to start the backend server
│ └── .env          # Backend environment variables
│
└── README.md       # Project documentation
```
---

## ⚙️ Environment Variables

> ⚠️ Both `.env` files are **git ignored** to protect sensitive information. Therefore, you must manually create your own .env files on the client and server folders.

### Backend (`/server/.env`)
```
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=<yourPassword>
MYSQL_DATABASE=postOfficeDatabase
PORT=8000
```
### Frontend (`/client/.env`)
```
VITE_API_URL=http://localhost:8000
```
---

### 1️⃣ Clone the repository
```bash
git clone https://github.com/EdwardVNguyen/SnailMail.git
cd SnailMail

### Install dependencies

cd server
npm install

cd client
npm install

### Run frontend and backend to run web application

cd server
npm run dev

cd client
npm run dev
