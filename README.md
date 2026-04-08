# 💰 Budget Tracker App

A full-stack financial management application built with the MERN stack (MongoDB, Express, React, Node.js). This API handles user authentication, secure password hashing, and budget tracking logic.

---

## 🔐 Test Credentials

Use these pre-configured accounts to test the application features:

### **Admin Account**
* **Email:** `admin@mail.com`
* **Password:** `admin123`

### **User Account**
* **Email:** `user@mail.com`
* **Password:** `userpass123`

---

## 🚀 Technical Features

* **Authentication:** Secure registration and login using `bcrypt` for password hashing.
* **Database:** MongoDB integration via Mongoose with custom pre-save hooks.
* **Security:** * Passwords are automatically hidden from API responses using `select: false` and `toObject` transformations.
    * CORS protection configured for local development.
* **Environment Configuration:** Robust `.env` handling for ports and database URIs.

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/budget-tracker-app.git](https://git@github.com:jpdegracia/budget-tracker-app.git)
cd budget-tracker-app