# Admin Dashboard & Authentication System Upgrade

Build a premium Admin Dashboard for the existing HTW Furniture Store, upgrading authentication from JWT-only to a hybrid Passport.js + JWT + Google OAuth system and creating a comprehensive admin panel rivaling Shopify/WooCommerce.

> [!IMPORTANT]
> This is a **very large project** spanning hundreds of files. I propose building it in **incremental phases**, starting with Phase 1 (database + auth) so each phase is testable and shippable before moving on. This plan covers all 8 phases but **I will implement Phase 1 first**, then seek approval to continue.

## User Review Required

> [!WARNING]
> **Google OAuth requires manual setup**: You need to create OAuth 2.0 credentials at [Google Cloud Console](https://console.cloud.google.com/) and provide `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in [.env](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/.env). Phase 1 will prepare the integration code but Google OAuth won't work until you supply these credentials.

> [!WARNING]
> **SMTP/Email requires configuration**: Email features (verification, password reset) require SMTP credentials. Currently the email service is stubbed. Phase 1 will build real Nodemailer templates, but you'll need to configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in [.env](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/.env).

> [!IMPORTANT]
> **Role change**: The existing `users.role` CHECK constraint allows [admin](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/admin.js#1-10), [manager](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/auth.js#67-73), `user`. The prompt requests adding `super_admin`. This requires an ALTER TABLE to update the CHECK constraint. Existing admin users will remain as [admin](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/admin.js#1-10) — you can manually promote one to `super_admin` after migration.

---

## Proposed Changes

### Phase 1A: Database Migrations

New migration files to extend the schema without breaking existing data.

#### [NEW] [001_auth_enhancements.sql](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrations/001_auth_enhancements.sql)
- Add columns to `users`: `google_id`, `email_verified`, `email_verification_token`, `password_reset_token`, `password_reset_expires`, `last_login_ip`, `failed_login_attempts`, `locked_until`, `two_factor_secret`, `two_factor_enabled`, `preferences`
- Update `role` CHECK constraint to include `super_admin`
- Add indexes on new columns

#### [NEW] [002_activity_logs.sql](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrations/002_activity_logs.sql)
- Create `activity_logs` table (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, timestamps)

#### [NEW] [003_coupons.sql](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrations/003_coupons.sql)
- Create `coupons` table (code, type, value, min_purchase, usage limits, date range, applicable products/categories, exclude_sale_items)

#### [NEW] [004_email_templates.sql](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrations/004_email_templates.sql)
- Create `email_templates` table (name, subject, body_html, body_text, variables)

#### [NEW] [005_sessions.sql](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrations/005_sessions.sql)
- Create `session` table for `connect-pg-simple` (sid, sess, expire)

#### [MODIFY] [migrate.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/db/migrate.js)
- Update to execute all migration files in `db/migrations/` in order

---

### Phase 1B: Authentication System Upgrade (Backend)

#### [NEW] [passport.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/config/passport.js)
- Configure Passport.js with Local Strategy (email/password via bcrypt)
- Configure Google OAuth 2.0 Strategy
- Configure JWT Strategy (for API compatibility)
- Serialize/deserialize user for session persistence

#### [MODIFY] [app.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/app.js)
- Add `express-session` with `connect-pg-simple` store
- Add `passport.initialize()` and `passport.session()`
- Session config: secure cookies, httpOnly, 24h maxAge, custom name `fs.sid`

#### [MODIFY] [auth.js (middleware)](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/auth.js)
- Enhance [auth](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/auth.js#4-39) middleware to check both session AND JWT token
- Add `isEmailVerified` middleware
- Add `hasRole(roles[])` middleware (replaces [adminOnly](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/auth.js#59-66)/[managerOnly](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/middleware/auth.js#67-73))
- Add `checkPermissions` middleware for fine-grained RBAC

#### [MODIFY] [authController.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/controllers/authController.js)
- Enhance [register](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/controllers/authController.js#15-51): Generate email verification token, send verification email
- Enhance [login](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/controllers/authController.js#52-93): Use Passport local, track `last_login_ip`, handle account lockout (5 attempts → 15min lock)
- Add `verifyEmail`: Token validation, update `email_verified`
- Add `forgotPassword`: Generate reset token, send email
- Add `resetPassword`: Validate token, update password, invalidate sessions
- Add `googleCallback`: Handle OAuth callback, create/link user
- Add [logout](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/store/index.ts#59-60): Destroy session + invalidate JWT

#### [MODIFY] [User.js (model)](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/models/User.js)
- Add `findByGoogleId(googleId)` method
- Add `incrementFailedLogin(id)` method
- Add `resetFailedLogin(id)` method
- Add `lockAccount(id, duration)` method
- Add `setEmailVerified(id)` method
- Add `setResetToken(id, token, expires)` method
- Add `findByResetToken(token)` method
- Add `findByVerificationToken(token)` method
- Update `ALLOWED_FIELDS` for new columns

#### [MODIFY] [auth.js (routes)](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/routes/auth.js)
- Add: `POST /verify-email`, `POST /forgot-password`, `POST /reset-password`, `POST /resend-verification`
- Add: `GET /google`, `GET /google/callback`
- Add: `POST /logout`

#### [NEW] [emailService.js (rewrite)](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/services/emailService.js)
- Replace stub with real Nodemailer transporter
- Create HTML email templates: Welcome/Verification, Password Reset, Order Confirmation, Admin Invite, Low Stock Alert
- Fallback to console logging when SMTP not configured

#### [NEW] [ActivityLog.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/models/ActivityLog.js)
- Model for activity_logs table (create, findAll with filters)

#### [MODIFY] [.env.example](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/.env.example)
- Add: `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `FROM_EMAIL`, `FROM_NAME`

---

### Phase 2: Admin Dashboard Layout Shell (Frontend)

#### [MODIFY] [layout.tsx (admin)](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/layout.tsx)
- Add dark/light mode toggle (next-themes)
- Enhanced sidebar: collapsible to icons, grouped navigation sections
- Add breadcrumbs component
- Admin user avatar with dropdown menu
- Notification bell with badge
- Add search trigger for CMD+K palette

#### [NEW] Admin shared components:
- `components/admin/DataTable.tsx` — Reusable table with sorting, filtering, pagination, row selection
- `components/admin/StatCard.tsx` — KPI card with trend indicator
- `components/admin/ConfirmDialog.tsx` — Destructive action confirmation
- `components/admin/SearchPalette.tsx` — CMD+K global search
- `components/admin/ImageUploader.tsx` — Multi-file drag-drop with preview

---

### Phase 3: Analytics Dashboard Enhancement

#### [MODIFY] [dashboard/page.tsx](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/dashboard/page.tsx)
- Add Recharts: Revenue line chart (7d/30d/90d toggle), Sales by Category doughnut, Top 10 Products bar chart
- Real-time polling via TanStack Query (refetchInterval)
- Activity feed: new orders, reviews, registrations
- Quick action buttons

#### [MODIFY] [adminController.js](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/controllers/adminController.js)
- Enhanced [getDashboard](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/server/controllers/adminController.js#10-52): More KPIs (AOV, conversion rate, low stock count)
- Add `getSalesAnalytics`: Time-series with date range filter
- Add `getProductAnalytics`: Top products, category breakdown
- Add `getCustomerAnalytics`: New vs returning customers

---

### Phase 4: Product Management

#### [MODIFY] [products/page.tsx](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/products/page.tsx)
- Full DataTable with TanStack Table: sortable columns, global search, category/stock/featured filters, bulk actions, pagination
- Row selection with checkboxes

#### [MODIFY] [products/new/page.tsx](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/products/new/page.tsx)
- Multi-step wizard: Basic Info → Media → Configurator → Inventory → SEO
- React Hook Form + Zod validation
- Image upload with react-dropzone, sortable grid

#### [MODIFY] Backend:
- Add product CRUD endpoints: `POST /admin/products`, `PUT /admin/products/:id`, `DELETE /admin/products/:id`
- Add `POST /admin/products/:id/duplicate`, `POST /admin/products/bulk-delete`
- Add `POST /api/upload/image` with Sharp optimization

---

### Phase 5: Order Management

#### [MODIFY] [orders/page.tsx](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/orders/page.tsx)
- DataTable with status badges, date range filters, search
- Export to CSV

#### [NEW] [orders/[id]/page.tsx](file:///c:/Users/Hani/OneDrive/Desktop/furniture%20project/client/src/app/(admin)/admin/orders/[id]/page.tsx)
- Order timeline (vertical stepper with icons)
- Customer card, items list with configuration swatches
- Payment details, shipping address
- Status update with email notification
- PDF invoice generation

---

### Phase 6: Customer & Inventory

#### [MODIFY] Customer pages: Enhanced list with search/filters, detail page with order history
#### [NEW] Inventory pages: Stock overview, low stock alerts, adjustment logging

---

### Phase 7: Marketing & Settings

#### [NEW] Coupons CRUD page and backend endpoints
#### [MODIFY] Settings pages: Store, Shipping, Payment, Staff management with invite flow

---

### Phase 8: Polish

- Dark/light mode across all admin pages
- Data export (CSV/PDF)
- Activity/audit log viewer
- Mobile responsiveness polish
- Deployment guide

---

## New Dependencies to Install

### Backend (`server/`):
```
passport passport-local passport-google-oauth20 passport-jwt express-session connect-pg-simple sharp
```

### Frontend (`client/`):
```
recharts next-themes @tanstack/react-table react-dropzone
```

---

## Verification Plan

### Automated Tests

Existing tests in `server/tests/` cover: auth, cart, configurator, orders, products, security, and DB. These use Jest + Supertest.

**Run existing tests after Phase 1 to ensure no regressions:**
```bash
cd server && npm test
```

**New tests to add for Phase 1:**
- `server/tests/auth-enhanced.test.js`: Test email verification flow, password reset flow, account lockout after 5 failures, Google OAuth callback handling
- `server/tests/migrations.test.js`: Verify all migration SQL files execute without error against a fresh DB

### Browser Testing

After Phase 2 (admin layout):
- Navigate to `/admin/dashboard` with an admin account
- Verify sidebar renders correctly, links navigate properly
- Test mobile viewport: sidebar collapses
- Test dark/light mode toggle

### Manual Verification

After Phase 1:
1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. **Register a new user** via `POST /api/auth/register` — verify email verification token is generated (check console logs if SMTP not configured)
4. **Login** with correct credentials — verify JWT + session are both created
5. **Login 5 times with wrong password** — verify account lockout returns 403
6. **Run migrations** via `npm run db:migrate` — verify all new tables/columns exist in PostgreSQL

> [!TIP]
> I recommend implementing **Phase 1 first** (database migrations + auth upgrade), verifying it works, then proceeding phase by phase. Each phase is designed to be independently testable. Should I proceed with Phase 1?
