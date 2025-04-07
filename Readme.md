# 💸 Wallet API – FX Edition

This project is a **NestJS-powered wallet API** built for seamless digital transactions, with support for currency conversion, wallet funding via Paystack, and robust authentication/authorization mechanisms.

---

## 🚀 Features

- 🔐 JWT Authentication with email verification guard
- 👛 Wallet management per user and currency
- 💵 Currency conversion with ExchangeRate API
- 📦 Redis caching for conversion rates (1 hour TTL)
- 💳 Paystack integration for wallet funding
- 🧾 Transaction history with filtering options
- 🎯 Modular architecture (user, wallet, transaction, auth, FX modules)

---

## 🛠️ Technologies

- **NestJS** (obviously)
- **Redis** (for caching FX rates like a pro)
- **Paystack** (for payment processing)
- **ExchangeRate API** (for FX conversions)
- **JWT** (for secure auth sessions)
- **PostgreSQL / TypeORM** (or whatever you plug in)
- **Swagger** (because we document like adults)

---

## 🧬 Core Modules

### 🔐 Authentication

- Token-based JWT Auth (`AuthGuard`)
- `EmailVerifiedGuard` to restrict access for non-verified users

### 👤 Users

- Sign up / login
- Email verification flag check
- Relations with wallet and transactions

### 💼 Wallets

- Created per user and currency
- Get balance
- Auto-fund via verified Paystack transactions

### 💸 Transactions

- Initiation and verification endpoints
- Transaction types (FUNDING, CONVERSION, etc.)
- Atomic DB operations with logging

### 🌐 FX Module

- `convert` endpoint to convert amounts between currencies
- `getRates` endpoint fetches rates from ExchangeRate API
- Redis caching (TTL: 3600s = 1 hour)
- Only returns rates from supported `CurrencyEnum`

---

## 📦 Installation

```bash
git clone https://github.com/your-org/wallet-fx-api.git
cd wallet-fx-api
npm install
cp .env.example .env
```

## 🧪 Running Locally

```bash
# Start Redis
redis-server

# Start the application
npm run start:dev

```

## 📄 Example .env

```env
JWT_SECRET=super-secret-string
JWT_ISSUER=wallet-fx-api
EXCHANGE_RATE_API_KEY=your-api-key
EXCHANGE_RATE_BASE_URL=https://v6.exchangerate-api.com/v6
PAYSTACK_SECRET_KEY=sk_test_xxxx
REDIS_HOST=localhost
REDIS_PORT=6379

```

## 🔍 API Endpoints

### Auth

- **POST /auth/register** - User registration
- **POST /auth/login** - User login

### Wallet

- **GET /wallet/balance** - Check wallet balance
- **POST /wallet/fund** - Fund wallet

### Transactions

- **GET /transactions** - Get transaction history (filterable)
- **POST /transactions/verify** - Verify transactions

### FX

- **POST /fx/convert** - Convert between currencies
- **GET /fx/rates** - Get current exchange rates

## 🛡️ Guards

- **AuthGuard**: Validates JWT and attaches user context
- **EmailVerifiedGuard**: Restricts access to verified users only

## 🧊 Redis Caching

- FX rates cached using from-to currency pair keys
- Automatic expiration after 1 hour (3600 seconds)
- Fallback to API when cache expires

## 🧠 Note

- Only currencies in CurrencyEnum are supported
- Conversion rates use NGN as base currency
- Errors are logged with descriptive messages
- All financial operations are atomic and transactional
