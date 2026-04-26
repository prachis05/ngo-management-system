# NGO Management System

## Overview

The NGO Management System is a full-stack web application designed to streamline the operations of non-governmental organizations, volunteers, and donors. It provides a centralized platform to manage events, volunteers, donations, and causes efficiently.

This system enables role-based access for Admins, NGOs, Volunteers, and Donors, ensuring each user interacts with features relevant to their responsibilities.

---

## Features

### Role-Based Access Control

* **Admin**

  * Manage users, NGOs, and verifications
  * View system-wide reports and analytics
  * Monitor volunteer activity

* **NGO**

  * Create and manage events
  * Add and manage causes
  * View donations and assigned volunteers
  * Manage tasks

* **Volunteer**

  * Browse and join events
  * View assigned tasks
  * Manage profile (skills, city, etc.)

* **Donor**

  * Browse NGOs and causes
  * Donate to specific causes
  * Optional monthly donations

---

## Core Functionalities

* Authentication with JWT
* Role-based dashboards
* NGO approval and verification system
* Event creation and volunteer assignment
* Cause-based donation system
* Donation tracking and reporting
* Volunteer profile management
* Admin analytics dashboard

---

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS (custom styling)

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Authentication

* JWT (JSON Web Tokens)
* bcrypt for password hashing

---

## Project Structure

```
frontend/
  ├── src/
  │   ├── pages/
  │   ├── context/
  │   ├── components/
  │   └── assets/

backend/
  ├── controllers/
  ├── models/
  ├── routes/
  ├── middleware/
  └── config/
```

---

## Installation & Setup

### 1. Clone the repository

```
git clone <your-repo-link>
cd ngosystem
```

---

### 2. Install dependencies

#### Backend

```
cd backend
npm install
```

#### Frontend

```
cd ../frontend
npm install
```

---

### 3. Environment Variables

Create a `.env` file in the backend folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

### 4. Run the application

#### Start backend

```
cd backend
npm run dev
```

#### Start frontend

```
cd frontend
npm run dev
```

---

## Future Enhancements

* Payment gateway integration (Stripe/Razorpay)
* Image upload for NGOs and causes
* Advanced filtering and search
* Notifications system
* Mobile responsiveness improvements

---

## UI Improvements

* Clean, modern dashboard design
* Role-based navigation
* Placeholder images for missing NGO content
* Improved card layouts and spacing
* Dropdown-based navigation for better usability

---

## Author

Developed as part of a Software Engineering project.

---

## License

This project is for academic purposes.
