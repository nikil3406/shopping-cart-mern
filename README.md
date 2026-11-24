# Shopping Cart MERN

## Run locally

Requirements: Node.js/npm and a MongoDB database (local MongoDB or MongoDB Atlas).

1. In `server`, copy `.env.example` to `.env` and set `MONGO_URI`, `JWT_SECRET`, and `STRIPE_KEY`.
2. In `client`, copy `.env.example` to `.env`.
3. Install and start the backend:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

4. In a separate terminal, install and start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```

5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Demonstrate a test payment

Use a Stripe **test-mode** secret key beginning with `sk_test_` for `STRIPE_KEY`. Never use a live key for a demo. The backend creates Stripe Checkout sessions from the signed-in user's saved cart; after checkout, it verifies the session with Stripe before clearing the cart.

1. Register or sign in, add products to the cart, and click **Secure Checkout**.
2. On the Stripe Checkout page, enter the successful test card `4242 4242 4242 4242`, any future expiry date, any three-digit CVC, and any postal code.
3. Submit the payment. Stripe redirects back to the app, where the payment is confirmed and the cart is cleared.
4. To demonstrate cancellation, return to the cart and click checkout again, then use the back/cancel link on Stripe Checkout.

Stripe test-mode payments do not charge a real card. See [Stripe's testing documentation](https://docs.stripe.com/testing) for additional test card numbers and scenarios.

## Cash on delivery

On the cart page, enter a delivery address and select **Place order - Cash on delivery**. The server saves the order with payment pending, clears the cart, and shows an order confirmation. No Stripe key is used for COD orders; payment is due on delivery.
