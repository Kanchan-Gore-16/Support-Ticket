# 🧠 Support Ticket Management System  
**Full Stack Assignment – React + Node.js + PostgreSQL**

A full-stack support ticket management system built using **React (Vite)** on the frontend and **Node.js + Express + PostgreSQL** on the backend. The application supports secure authentication, ticket management, auto-refresh, optimistic updates, notes, and a stats dashboard.

---

## ✅ Features Overview

### 🔐 Authentication
- Register & Login
- JWT-based authentication
- Token stored in `localStorage`
- Protected routes using Auth Guards

---

### 📩 Ticket Inbox
- Paginated ticket list
- Filters:
  - Status (open / pending / resolved)
  - Priority (low / medium / high)
- Debounced search (title & customer email)
- Auto-refresh every **10 seconds**
- Clicking a ticket opens a **side drawer**

---



- Full ticket details
- Change status & priority
- Notes section:
  - Latest notes shown first
  - Add new notes instantly
- Created & Updated timestamps

---

### ⚡ Optimistic Updates (Section B)
- Status & priority updates reflect instantly
- Notes appear immediately
- Full rollback on API failure using React Query

---

### 📊 Stats Dashboard (Bonus)
- Total tickets
- Open / Pending / Resolved counts
- High-priority count
- Last 7 days ticket creation chart

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- React Query
- Axios
- Plain CSS

### Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   ├── server.js
│   └── seeders/
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
```

---

## 🚀 Setup Instructions

### Backend Setup
```
cd backend  
npm install  
```
Create .env file:
```
DB_HOST=localhost  
DB_PORT=5433  
DB_USER=postgres  
DB_PASSWORD=password  
DB_NAME=support_inbox  
JWT_SECRET=JWT_SECRET  
PORT=4000  
```
Run migrations & seed data:
```
npm run migrate  
npm run seed  
```
Start backend:
```
npm run dev  
```
---

### Frontend Setup
```
cd frontend  
npm install  
npm run dev  
```
Open in browser:

http://localhost:5173  

---

## ✅ Assignment Status

A. Pages / UI – ✅ Completed  
B. Optimistic Updates – ✅ Completed  
C. Auto Refresh – ✅ Completed  
D. UX States – ✅ Completed  

E. Bonus (Hard Part – Real-Time Simulation)  
❌ Not completed due to time constraints

---

## 👤 Author

Kanchan Gore  
Full Stack Developer  

### 🧾 Ticket Detail Drawer
<img width="1913" height="910" alt="Register" src="https://github.com/user-attachments/assets/35c18487-f43d-4c64-81d5-24950a0235f3" />
<img width="1918" height="968" alt="Invalid_Credentials" src="https://github.com/user-attachments/assets/40e884ce-294a-4955-a547-1536e3cc29ef" />
<img width="1907" height="968" alt="Login" src="https://github.com/user-attachments/assets/106b6c17-0254-49be-a0e4-ae39d3139c16" />
<img width="1919" height="916" alt="Inbox" src="https://github.com/user-attachments/assets/3eea4161-9344-40ce-a9e4-75c8a877e320" />
<img width="1912" height="912" alt="Search" src="https://github.com/user-attachments/assets/3f247a0a-6374-43be-bb29-8acca4634c8d" />
<img width="1919" height="909" alt="Filters" src="https://github.com/user-attachments/assets/f13c361d-bb02-4a54-891a-b7ac023edc53" />
<img width="1919" height="924" alt="Side_drawer" src="https://github.com/user-attachments/assets/428fa4d5-aeb5-488f-877c-313b0485f278" />
<img width="1918" height="924" alt="Stats" src="https://github.com/user-attachments/assets/8ef685d9-719a-4767-87a3-225479101966" />


