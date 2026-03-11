# Furniture Store Project Report

A comprehensive overview of the technical architecture, features, and schemas of the Furniture Store website.

---

## 1. Project Overview
The Furniture Store project is a full-stack e-commerce application designed for selling and customizing furniture. It features a modern, interactive frontend built with Next.js and a robust backend built with Node.js/Express, utilizing PostgreSQL for data persistence.

---

## 2. Technology Stack & Libraries

### Frontend (Client)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/)
- **Smooth Scrolling**: [Lenis](https://github.com/darkroomengineering/lenis)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Icons**: [Lucide React](https://lucide.dev/)
- **Transitions**: `next-view-transitions`

### Backend (Server)
- **Environment**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database Driver**: [node-postgres (pg)](https://node-postgres.com/)
- **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/), `bcryptjs`
- **Validation**: [Joi](https://joi.dev/)
- **Security**: [Helmet](https://helmetjs.github.io/), `express-rate-limit`, `cors`
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Compression**: `compression`
- **Logging**: `morgan`

---

## 3. Core Features

### 🛒 E-commerce & Shopping
- **Product Catalog**: Dynamic browsing of products by categories (Sofas, Chairs, Tables, etc.).
- **Product Configurator**: Highly interactive customization of furniture (Color, Material, Size, Design, Accessory) using a JSONB configuration schema.
- **Cart System**: Multi-layered cart supporting both guest sessions and authenticated users.
- **Wishlist**: Save favorite designs for later.
- **Checkout Flow**: Multi-step checkout with address management and order summary.
- **Personalized Designs**: Users can save specific customizations of furniture.

### 👤 User & Account
- **Authentication**: Secure login, registration, and invitation-based onboarding.
- **Dashboard**: Track order history, manage profile settings, and view saved designs.
- **Reviews**: Product rating and review system with "Verified Purchase" support.

### 🛠️ Admin & Management
- **Analytics Dashboard**: Real-time insights into sales, users, and product performance.
- **Product Management**: Full CRUD operations for products, categories, and customization options.
- **Order Management**: Track and update order statuses (Pending -> Shipped -> Delivered).
- **User Management**: Admin control over user roles (Admin, Manager, User) and account status.
- **Media Management**: Upload and manage product images.

---

## 4. Database Schema (PostgreSQL)

The database follows a relational structure optimized for configuration-heavy products.

### Core Tables
1.  **`users`**: Stores user credentials, roles, and profiles.
    - Fields: `id`, `email`, `password_hash`, `name`, `phone`, `role` (admin/manager/user), `avatar_url`, `is_active`.
2.  **`categories`**: Nested categories for product organization.
    - Fields: `id`, `name`, `slug`, `parent_id` (Self-referencing), `sort_order`.
3.  **`products`**: Central product information.
    - Fields: `id`, `name`, `slug`, `sku`, `base_price`, `category_id`, `is_configurable`, `is_featured`, `is_new`, `meta_info`.
4.  **`product_images`**: Stores multiple images per product with a "Primary" flag.
5.  **`configuration_options`**: Defines what can be customized (Color, Material, etc.).
6.  **`configuration_values`**: Specific options (e.g., "Velvet Blue") with price adjustments.
7.  **`orders`**: Tracks transactions and shipping.
    - Fields: `order_number`, `status`, `payment_status`, `total_amount`, `shipping_address` (JSONB), `billing_address` (JSONB).
8.  **`order_items`**: Snapshots of products purchased, including their specific configurations.
9.  **`cart_items`**: Persistent cart storage linking products and configurations.
10. **`saved_designs`**: User-saved furniture configurations with sharing tokens.
11. **`reviews`**: Product feedback loop.
12. **`invitations`**: Management of administrative invites.

---

## 5. Frontend & Backend Architectures

### Frontend Architecture (Next.js)
- **App Router**: Uses a modular directory structure.
  - `(shop)`: Public-facing store pages.
  - `(auth)`: Login and registration flow.
  - `(admin)`: Management dashboard for staff.
  - `dashboard`: User account management.
- **Components**: Separated into `layout`, `product`, `cart`, `admin`, and `motion` (for reusable animations).
- **Store**: Zustand stores for globally shared states (`Cart`, `Wishlist`).

### Backend Architecture (Express)
- **Controllers**: Logic separated by domain (Order, Product, User, etc.).
- **Models**: Abstraction layer for database queries using `pg`.
- **Middleware**: Custom handling for JWT verification, role-based access control, and error handling.
- **Services**: External integrations (e.g., Email service).
- **Tests**: Comprehensive test suite using [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest).

---

## 6. Directory Map
```text
├── client/
│   ├── src/app/        # Next.js Pages & Routes
│   ├── src/components/ # UI Components
│   ├── src/store/      # Zustand State
│   └── src/lib/        # Utils & Data fetching
└── server/
    ├── controllers/    # Business Logic
    ├── models/         # DB Layer
    ├── routes/         # API Endpoints
    ├── db/             # Schema & Migrations
    └── tests/          # Backend Testing
```
