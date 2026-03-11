# Furniture Store: Exhaustive Technical Report

## 1. Project Overview
The Furniture Store is a premium, full-stack e-commerce platform designed for high-end furniture sales and customization. It leverages a modern React-based frontend with a robust, security-hardened Node.js API.

---

## 2. Comprehensive Technology Stack

### Frontend Architecture
- **Framework**: Next.js 14.2.35 (App Router with Server Components)
- **State Management**: Zustand 5.0.11 (with `persist` middleware for local storage)
- **UI/UX Libraries**:
  - **Framer Motion 12.34.3**: Advanced layout transitions and micro-interactions.
  - **GSAP 3.14.2**: High-performance scroll-driven and timeline animations.
  - **Lenis 1.3.17**: Smooth scrolling foundation.
  - **Lucide React**: Vector icons.
  - **Tailwind CSS**: Utility-first styling.
- **Form & Data**:
  - **React Hook Form 7.71.2**: Managed form states.
  - **Zod 4.3.6**: Schema-based form validation.
  - **TanStack Query 5.90.21**: Server state synchronization and caching.

### Backend Architecture
- **Runtime**: Node.js
- **Server**: Express 5.2.1
- **Security**:
  - **Helmet 8.1.0**: HTTP header security.
  - **Express Rate Limit 8.2.1**: Brute-force protection (Global, Auth-specific, and Configurator-specific).
  - **BcryptJS 3.0.3**: Password hashing.
  - **JSON Web Token (JWT) 9.0.3**: Stateless authentication.
- **Utilities**:
  - **Joi 18.0.2**: API request validation schemas.
  - **Multer 2.1.0**: Multipart/form-data handling for image uploads.
  - **Nodemailer 8.0.1**: Transactional email services.
  - **Compression 1.8.1**: Gzip compression for better performance.
  - **Morgan 1.10.1**: HTTP request logging.

---

## 3. Database Schema (PostgreSQL 16+)

### Core Infrastructure
- **Extension**: `uuid-ossp` for UUID generation.
- **Auto-Update**: Plpgsql triggers for `updated_at` timestamps on all primary tables.

### Table Definitions

| Table | Primary Key | Key Columns |
| :--- | :--- | :--- |
| **`users`** | `id (UUID)` | `email (unique)`, `password_hash`, `name`, `role` (admin, manager, user), `is_active` |
| **`categories`** | `id (UUID)` | `name`, `slug (unique)`, `parent_id` (FK categories), `sort_order` |
| **`products`** | `id (UUID)` | `name`, `sku (unique)`, `base_price`, `category_id` (FK), `is_configurable` |
| **`product_images`**| `id (UUID)` | `product_id` (FK), `url`, `is_primary`, `sort_order` |
| **`configuration_options`**| `id (UUID)` | `product_id` (FK), `name`, `type` (color, material, size, etc.) |
| **`configuration_values`** | `id (UUID)` | `option_id` (FK), `value`, `price_adjustment`, `stock_quantity` |
| **`cart_items`** | `id (UUID)` | `user_id` (FK), `session_id`, `product_id` (FK), `configuration (JSONB)` |
| **`orders`** | `id (UUID)` | `order_number (unique)`, `user_id` (FK), `status`, `total_amount`, `shipping_address (JSONB)` |
| **`order_items`** | `id (UUID)` | `order_id` (FK), `product_id` (FK), `quantity`, `unit_price`, `configuration (JSONB)` |
| **`reviews`** | `id (UUID)` | `user_id` (FK), `product_id` (FK), `rating (1-5)`, `is_approved` |
| **`saved_designs`** | `id (UUID)` | `user_id` (FK), `product_id` (FK), `configuration (JSONB)`, `share_token` |

---

## 4. API Endpoint Schema

### Authentication (`/api/auth`)
- `POST /register`: User onboarding (Joi validated: name, email, password).
- `POST /login`: JWT issuance (Strictly rate-limited to 5 attempts/15 min).
- `GET /me`: Current user profile (Private).
- `PUT /profile`: Update profile details (Private).
- `PUT /password`: Secure password rotation (Private).

### Products (`/api/products`)
- `GET /`: Paginated list (Filters: category, price range, search, sort).
- `GET /featured`: Highlighted products (Limit: 8).
- `GET /:idOrSlug`: Deep product details including related items.
- `POST /` (Admin): Create product (Joi: `productSchema`).
- `PUT /:id` (Admin): Partial update.
- `DELETE /:id` (Admin): Soft-delete logic via `is_active` or hard delete.

### Orders & Checkout (`/api/orders`)
- `POST /`: Submit new order (Validates stock, calculates tax/shipping).
- `GET /`: Authenticated user's order history.
- `GET /:id`: Specific order tracking and itemized list.
- `PUT /:id/cancel`: User-initiated cancellation (if status permits).

### Configurator (`/api/configurator`)
- `GET /options/:productId`: Fetch available customization options.
- `POST /validate`: Server-side validation of a custom configuration.
- `GET /price`: Real-time price calculation based on selected adjustments.

---

## 5. Frontend State Schema (Zustand)

### Cart Store (`useCartStore`)
- **State**: `items: CartItem[]`, `isOpen: boolean`.
- **Computed**: [totalItems()](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/cart.ts#78-79), [subtotal()](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/cart.ts#79-84).
- **Persistence**: Synced to `htw-cart` in LocalStorage.
- **CartItem Shape**: `{ id, product, quantity, selectedColor, selectedSize }`.

### Wishlist Store (`useWishlistStore`)
- **State**: `items: Product[]`.
- **Methods**: [addItem](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/cart.ts#29-57), [removeItem](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/cart.ts#58-60), [isInWishlist](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/wishlist.ts#25-26).
- **Persistence**: Synced to `htw-wishlist`.

---

## 6. Detailed Feature Breakdown

### 💎 Product Configurator
Interactive 3D-like experience allowing users to modify:
- **Materials**: Velvet, Leather, Linen, etc.
- **Colors**: Dynamic color picking with price adjustments.
- **Sizes**: Dimensions (W x H x D) with stock tracking.
- **Accessories**: Optional add-ons (cushions, legs, etc.).

### 🛡️ Security Architecture
- **Rate Limiting**: Three layers (Global, Auth, Configurator) to prevent DDoS and enumeration.
- **CORS**: Strict origin white-listing.
- **JWT Strategy**: Token-based auth stored in Secure/HttpOnly cookies or Authorization headers.
- **RBAC**: Role-Based Access Control (Admin, Manager, User levels).

### 🚀 Performance & SEO
- **Images**: Next/Image for WebP optimization.
- **SEO**: Meta title/description fields in database for every product and category.
- **Caching**: TanStack Query for frontend API result caching.
- **Compression**: Response compression in Express.

---

## 7. Folder Structure Detail
```text
├── client/                     # Next.js Frontend
│   └── src/
│       ├── app/ (auth)         # Login/Register flows
│       ├── app/ (shop)         # Product pages, cart, checkout
│       ├── app/ (admin)        # Management dashboard
│       ├── components/layout   # Navbar, Footer, Sidebar
│       ├── components/product  # ProductCard, Configurator, Grid
│       ├── store/              # Zustand stores
│       └── types/              # TypeScript definitions
└── server/                     # Node.js Backend
    ├── controllers/            # Logic (authController, productController, etc.)
    ├── routes/                 # Endpoint routing mapping
    ├── models/                 # DB queries (Product.js, Order.js, etc.)
    ├── validation/             # Joi schemas for all requests
    └── middleware/             # Auth, Rate-limit, Error-handling
```
