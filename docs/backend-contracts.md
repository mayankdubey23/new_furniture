# Backend Endpoint Contracts

This document captures the frontend contracts for checkout, orders, cart, wishlist, and user auth.

## Transport

- Frontend calls same-origin `/api/*` routes with `credentials: include`.
- In `external` mode, `proxy.ts` forwards all `/api/*` routes to `EXTERNAL_API_BASE_URL`.
- `lib/api/externalRoutes.ts` only maps route-name differences, such as `/api/products` to `/api/product`.
- External backend requests receive these headers when `PUBLIC_KEY` is configured:
  - `Authorization: Bearer <PUBLIC_KEY>`
  - `x-public-key: <PUBLIC_KEY>`
  - `public-key: <PUBLIC_KEY>`
- User auth currently depends on an HTTP-only cookie named `user-token`.
- JSON errors should use `{ "error": "message" }`.

## Auth

### `GET /api/auth/user/me`

Returns current customer session.

Response:

```json
{
  "authenticated": true,
  "user": {
    "id": "user-id",
    "name": "Customer Name",
    "email": "customer@example.com"
  }
}
```

Unauthenticated response:

```json
{ "authenticated": false, "user": null }
```

### `POST /api/auth/user/login`

Request:

```json
{
  "email": "customer@example.com",
  "password": "password"
}
```

Success must set the `user-token` cookie and return:

```json
{ "success": true, "name": "Customer Name", "email": "customer@example.com" }
```

Special error codes currently used by the frontend:

```json
{ "code": "PASSWORD_SETUP_REQUIRED", "error": "..." }
{ "code": "USE_OTP_LOGIN", "error": "..." }
{ "code": "USE_GOOGLE_LOGIN", "error": "..." }
{ "code": "USE_GOOGLE_OR_OTP_LOGIN", "error": "..." }
```

### `POST /api/auth/user/register`

Request:

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+919876543210",
  "otpCode": "123456",
  "password": "password"
}
```

When phone OTP is disabled, `phone` and `otpCode` may be blank.

Success must set the `user-token` cookie and return:

```json
{
  "success": true,
  "name": "Customer Name",
  "email": "customer@example.com",
  "completedAccount": false
}
```

### `GET /api/auth/user/otp/config`

Response:

```json
{ "enabled": true }
```

### `POST /api/auth/user/otp/send`

Request:

```json
{
  "phone": "+919876543210",
  "purpose": "login"
}
```

`purpose` is `login` or `signup`.

Response:

```json
{ "success": true, "phone": "+919876543210" }
```

### `POST /api/auth/user/login-otp`

Request:

```json
{
  "phone": "+919876543210",
  "otpCode": "123456"
}
```

Success must set the `user-token` cookie and return:

```json
{
  "success": true,
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+919876543210"
}
```

### `POST /api/auth/user/logout`

Clears the `user-token` cookie.

Response:

```json
{ "success": true }
```

## Cart

Commerce item shape:

```json
{
  "id": "line-id",
  "productId": "product-id",
  "name": "Product name",
  "image": "/products/sofa/main.png",
  "price": 20000,
  "quantity": 1,
  "selectedColor": "Olive Velvet",
  "selectedColorImage": "/products/sofa/main.png",
  "selectedSize": "3 Seater",
  "selectedMaterial": "Fabric",
  "selectedFinish": "",
  "selectedAddons": [],
  "configurationNotes": ""
}
```

### `GET /api/cart/current`

Requires signed-in user cookie.

Response:

```json
{ "items": [] }
```

### `PUT /api/cart/current`

Request:

```json
{ "items": [] }
```

Response:

```json
{ "success": true, "items": [] }
```

### `DELETE /api/cart/current`

Response:

```json
{ "success": true }
```

## Wishlist

Wishlist item shape is the cart item shape without `quantity`.

### `GET /api/wishlist/current`

Response:

```json
{ "items": [] }
```

### `PUT /api/wishlist/current`

Request:

```json
{ "items": [] }
```

Response:

```json
{ "success": true, "items": [] }
```

### `DELETE /api/wishlist/current`

Response:

```json
{ "success": true }
```

## Checkout And Orders

### `POST /api/orders`

Creates a COD order or initializes a Razorpay order.

Request:

```json
{
  "items": [
    {
      "productId": "line-or-product-id",
      "name": "Product name",
      "price": 20000,
      "image": "/products/sofa/main.png",
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "+919876543210",
    "country": "IN",
    "state": "Delhi",
    "city": "New Delhi",
    "pincode": "110001",
    "addressLine1": "Street address",
    "addressLine2": "Apartment",
    "address": "Street address, Apartment"
  },
  "notes": "Delivery note",
  "paymentMethod": "cod"
}
```

COD success:

```json
{
  "success": true,
  "orderId": "order-id",
  "trackingNumber": "FL-AB12CD34",
  "totalPrice": 20000,
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "account": null
}
```

Razorpay success:

```json
{
  "success": true,
  "orderId": "order-id",
  "trackingNumber": "FL-AB12CD34",
  "totalPrice": 20000,
  "paymentMethod": "razorpay",
  "paymentStatus": "pending",
  "requiresPayment": true,
  "gateway": {
    "provider": "razorpay",
    "keyId": "rzp_test_xxx",
    "orderId": "order_xxx",
    "amount": 2000000,
    "currency": "INR",
    "name": "Furniture Lele",
    "description": "Order #ABC123",
    "prefill": {
      "name": "Customer Name",
      "email": "customer@example.com",
      "contact": "+919876543210"
    }
  }
}
```

### `GET /api/orders/current`

Requires signed-in user cookie. Returns current user's order history.

Response:

```json
{ "orders": [] }
```

Each order should include:

```json
{
  "_id": "order-id",
  "trackingNumber": "FL-AB12CD34",
  "totalPrice": 20000,
  "totalItems": 1,
  "status": "pending",
  "paymentMethod": "cod",
  "paymentStatus": "pending",
  "createdAt": "2026-04-28T00:00:00.000Z",
  "estimatedDelivery": "2026-05-01T00:00:00.000Z",
  "customer": {},
  "items": [],
  "statusTimeline": [],
  "returnRefundRequests": []
}
```

### `POST /api/orders/track`

Request:

```json
{
  "reference": "order-id-or-tracking-number",
  "email": "customer@example.com"
}
```

If signed in, the cookie email is used instead of the request email.

Response is a single sanitized order object.

### `POST /api/orders/:id/returns`

Creates a return, refund, exchange, or combined request.

Request:

```json
{
  "email": "customer@example.com",
  "requestType": "exchange",
  "reason": "Damaged item",
  "details": "The product arrived damaged.",
  "items": [
    { "itemIndex": 0, "quantity": 1 }
  ]
}
```

`requestType` values:

- `return`
- `refund`
- `exchange`
- `return-refund`

Success:

```json
{
  "success": true,
  "message": "Your return/refund request has been submitted. Our team will review it shortly.",
  "order": {}
}
```

### `GET /api/orders/:id/returns`

Returns return/refund/exchange requests for an order.

Response:

```json
{ "requests": [] }
```

## Razorpay

### `GET /api/payments/razorpay/config`

Response:

```json
{
  "enabled": true,
  "keyId": "rzp_test_xxx"
}
```

### `POST /api/payments/razorpay/verify`

Request:

```json
{
  "orderId": "local-order-id",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature"
}
```

Success:

```json
{
  "success": true,
  "order": {}
}
```

## Current Routing Decision

These contracts are owned by the external backend in `external` mode. The
frontend keeps the same same-origin `/api/*` calls, and `proxy.ts` forwards them
to `EXTERNAL_API_BASE_URL`.

Only routes whose backend path differs from the frontend path need an entry in
`lib/api/externalRoutes.ts`. Every other `/api/*` route is forwarded unchanged.
