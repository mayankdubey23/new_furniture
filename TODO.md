# Backend, Database & Admin Panel TODO

✅ **Step 1:** Create TODO.md with detailed steps

✅ **Step 2:** Install dependencies (`npm i bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken swr`)

✅ **Step 3:** Create database connection (`lib/mongoose.ts`) & .env files

✅ **Step 4:** Create models (`models/Product.ts`, `models/Order.ts`)

✅ **Step 11:** Backend & Admin Complete ✅

### **Step 9: Frontend Integration**
- Add SWR to app/layout.tsx providers
- app/page.tsx fetch products
- components/sections/ProductSection: accept id, fetch data
- context/CartContext: fetch product name/price/image by ID
- app/cart/page.tsx create from CartContext
- Navbar: links to cart/admin

### **Step 10: Dynamic Product Page**
- app/products/[id]/page.tsx use ProductSection

### **Step 11: Test**
- `npm run dev`
- node lib/seed.js (after Mongo setup)
- /admin login admin/admin
- CRUD, dynamic home

**Next:** Setup MongoDB (Atlas free or local), run seed, confirm connection.

