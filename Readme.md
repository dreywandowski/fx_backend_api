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

- **NestJS**
- **Typescript**
- **Redis**
- **Paystack** (for payment processing)
- **ExchangeRate API** (for FX conversions)
- **JWT**
- **BitBuy** (for Trading)
- **PostgreSQL / TypeORM**
- **Swagger**

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
git clone https://github.com/dreywandowski/fx_backend_api.git
cd fx_backend_api
npm install
cp .env.example .env
```

## 🧪 Running Locally

```bash
# Start Redis
redis-server

# Run Migrations
npm run migration:run

# Run the application
npm run start:dev

```

## 📄 Assumptions

- Node JS > 20
- Mysql installed
- Base Currency is in NGN
- To fund other currrencies the amount will be converted, deducted from the NGN wallet and then credited to the wallet
- Only verified users are allowed to use the wallet endpoints

## 📄 Architerctural desisions

- Used Database to log 3rd Party API logs due to time constraints. Using Mongo DB or archiving older logs would be better for scalability
- Used the repository pattern, entity-based migrations for code sanity.
- OTPs are generated and saved to Redis and expire under 5 minutes.
- Users can enable 2fa using email or totp and also have the chance to generate backup codes.
- Bitbuy (https://bybit-exchange.github.io/docs/v5/) is used for trading, get secret and app keys from there.
- Exchange API (https://www.exchangerate-api.com/docs) is used for FX conversion.
- An hosted version of this application is available on https://fx.dreywandowski.ng/api

## 🔍 API Endpoints

### Auth

- **POST /auth/register** - User registration
- **POST /auth/verify** - Verify user
- **POST /auth/login** - User login

### Wallet

- **GET /wallet/balance** - Check wallet balance
- **POST /wallet/fund** - Fund wallet
- **POST /wallet/trade** - Trade across currencies
- **POST /wallet/trade-history** - Get trading history

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

Swagger Link ==> https://fx.dreywandowski.ng/api/docs
