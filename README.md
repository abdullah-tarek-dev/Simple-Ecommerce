# 🛒 Simple E-Commerce

A simple e-commerce project built with a separate Front-End and Back-End architecture. It allows users to browse products, add items to their cart, and place orders. It also includes an admin panel to manage products, users, and orders.

---

## 📌 Project Overview

This is a basic e-commerce application that includes the following features:

- User registration and login
- Admin login
- Browse and view product details
- Add products to shopping cart
- Place orders
- Admin panel to manage users, products, and orders

---

## 📁 Project Structure

---

## 🧰 Technologies Used

### 🎨 Front-End
- React
- React Router
- Axios
- CSS

### ⚙️ Back-End
- Node.js
- Express.js
- PostgreSQL
- `pg` (PostgreSQL client)
- `bcrypt` (for password hashing)
- `jsonwebtoken` (JWT for authentication)

---

## ⚙️ Running the Project Locally

### 1️⃣ Set up PostgreSQL Database

Make sure PostgreSQL is installed and running locally. Create a database named `postgres` (or any name you prefer).

### 2️⃣ Create `.env` File in `Back-End` Folder

Inside the `Back-End` directory, create a `.env` file with the following content:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=postgres
JWT_SECRET=30309011500256abdullah

 Run the Back-End Server
Copy code
cd Back-End
npm install
npm start

Run the Front-End

Copy code
cd Front-End
npm install
npm start






🔐 Login System
There are two types of users:

Admin: can manage products, users, and orders

Regular User: can browse products, add to cart, and place orders

Authentication is handled using JWT, and tokens are stored in LocalStorage.


 Deployment Issue (Back-End)
I attempted to deploy the Back-End using services like:

Render

Railway

However, these platforms currently require a credit card even for free tier usage (especially for PostgreSQL databases or web services).

🔴 As a result, the Back-End is not deployed online. The project works locally only.


