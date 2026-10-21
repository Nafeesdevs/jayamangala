# E-commerce Backend (Node + Express + MongoDB)

## Setup
1. `npm install`
2. Edit `.env` (Mongo url, JWT secret, Cloudinary keys, QR image/UPI id)
3. `npm run dev` (or `npm start`)

On first start a **default admin** and a **demo user** are created from `.env`
(`ADMIN_PHONE/ADMIN_PASSWORD`, `DEMO_PHONE/DEMO_PASSWORD`).

All routes are prefixed with `/api/v1`. Send the token as `Authorization: Bearer <token>`.
Image uploads use **form-data**.

## Order flow (QR payment)
1. Customer adds products to wishlist -> moves to cart -> cart.
2. `GET /payment/qr` -> show QR/barcode, customer pays the cart total (`totalAmount` from `GET /cart` + delivery charge).
3. `POST /payment/upload` (form-data: `amount`, `transactionId`, `screenshot`) -> returns `paymentId`.
4. `POST /order` with `{ paymentId, address, pincode, name?, phone?, deliveryDate? }`. Without a valid screenshot payment the order is refused. The paid amount must equal the order total.
5. Admin sees the screenshot in `GET /orders` (`payment.screenshot`) or `GET /payments`, then `PUT /payment/status/:id` -> `Verified` / `Rejected`.
   - Verified: order payment becomes `Paid`, admin can move the order forward.
   - Rejected: order is cancelled and stock restored.
6. Admin updates status: `Ordered -> Processing -> Shipped -> Out for Delivery -> Delivered` (`PUT /order/status/:id`).

## Endpoints
| Module | Method & Path | Access | Notes |
|---|---|---|---|
| Health | GET `/health` | public | api + db status |
| Auth | POST `/register`, `/login`; GET `/logout` | public | |
| Profile | GET/PUT `/profile` | user | PUT: name, email, addresses, oldPassword+newPassword |
| Profile | GET `/profile/order-total` | user | total amount of own orders |
| User CRUD | GET/POST `/users` | admin | list has totalAmount per user |
| User CRUD | GET/PUT/DELETE `/user/:id` | admin | |
| User | GET `/user/:id/order-total` | admin | total amount, orders, cancelled |
| Category | GET `/category`, GET `/category/:id` | public | |
| Category | POST `/category`, PUT/DELETE `/category/:id` | admin | form-data `name,status,image` |
| Brand | GET `/brand`, GET `/brand/:id` | public | |
| Brand | POST `/brand`, PUT/DELETE `/brand/:id` | admin | form-data `name,description,status,image` |
| Product | GET `/products` (`search,category,brand,minPrice,maxPrice,page,limit`), GET `/product/:id`, GET `/products/category/:name` | public | |
| Product | POST `/products`, PUT/DELETE `/product/:id` | admin | form-data `name,price,oldprice,category,brand,description,stock,status,productimage` |
| Cart | GET `/cart`, POST `/cart`, PUT `/cart/update`, POST `/cart/remove`, DELETE `/cart` | user | body `{productId, quantity}` |
| Wishlist | GET `/whislist`, POST `/whislist` (toggle), DELETE `/whislist/item/:productId`, DELETE `/whislist` | user | |
| Wishlist -> Cart | POST `/whislist/move-to-cart` | user | body `{productId}` or empty for all |
| Payment | GET `/payment/qr`, POST `/payment/upload`, GET `/payment/my` | user | |
| Payment | GET `/payments?status=`, PUT `/payment/status/:id`, DELETE `/payment/:id` | admin | |
| Payment | GET `/payment/:id` | owner/admin | |
| Order | POST `/order` | user | needs `paymentId` |
| Order | GET `/orders`, GET `/orders/stats`, PUT `/order/status/:id`, PUT/DELETE `/order/:id` | admin | |
| Order | GET `/orders/my`, GET `/order/:id`, GET `/order/track/:id`, PUT `/order/cancel/:id` | user | `:id` = `_id` or `ORD-XXXXXX` |
| Order | GET `/orders/user/:userId` | admin or same user | single user's orders |
