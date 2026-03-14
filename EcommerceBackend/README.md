#  E-CommerceBackend (Node.js · Express · MongoDB)
Backend API for a simple E-Commerce application — users, products, categories, cart, orders, FAQ, JWT authentication and admin role.

---

## 📌 Project overview
This repository contains the server-side code of an E-Commerce application built with Node.js, Express and MongoDB (Mongoose).  
Main features:
- User registration/login (JWT)
- Roles (user / admin) and soft delete
- Product CRUD (admin-protected where needed)
- Category / SubCategory
- Cart (add/update/remove) and Checkout → Order creation
- Order management (user orders + admin view + status update)
- FAQ management (admin create / public read)
- Basic error handling and middleware (auth, admin-only)

---

## 🧰 Tech stack
- Node.js (v16+ recommended)
- Express
- MongoDB + Mongoose
- JSON Web Tokens (jsonwebtoken)
- bcryptjs (password hashing)
- dotenv (env variables)
- nodemon (dev)

---

## 🔧 Prerequisites
- Node.js & npm installed
- MongoDB running locally or MongoDB Atlas connection string
- (optional) Postman or Thunder Client to test APIs

---

## ⚙️ Quick setup (local)
```bash
# clone
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# install
npm install

# create .env file
# see .env example below

# run (dev)
npm run dev   # using nodemon
# or
npm start
