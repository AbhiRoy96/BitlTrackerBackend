# BitlTracker Backend

BitlTracker is a comprehensive backend system for managing port-to-port logistics, shipping rates, and blockchain-verified payments. The project is structured as a set of microservices and background jobs that handle everything from distance calculation and rate management to Ethereum-based transaction validation.

## Project Structure

The repository is divided into several key components:

- **`api-main/`**: The core REST API service. Handles port data, distance calculations, shipping rates, and booking management.
  - **Endpoints**:
    - `POST /api/session`: Authorize and generate a session token.
    - `POST /api/portDistance`: Calculate distance between two ports.
    - `GET /api/countries`: List all available countries.
- **`api-payment/`**: A dedicated service for generating payment links and handling the payment workflow.
  - **Endpoints**:
    - `POST /generate/payout`: Create a secure payment URL for a booking.
    - `GET /payment/:token`: Verify payment validity and render payment UI.
- **`job-blockchain-validation/`**: A background service that monitors the Ethereum blockchain (Ropsten testnet) for payment events related to bookings.
- **`job-payment-reconciler/`**: A reconciliation job that verifies pending transactions against blockchain data and updates booking statuses.
- **`solidity/`**: Contains the Smart Contract (`merc.sol`) used for recording shipment transactions on the blockchain.
- **`db-dump/`**: MongoDB database dumps for initializing the system with necessary data (shipments, rates, port data, etc.).
- **`raw-data/`**: CSV files containing raw data for ports, countries, and shipping rates.

## Core Services & Ports

| Service | Port | Description |
|---------|------|-------------|
| api-main | 3000 | Main backend API for logistics and bookings. |
| api-payment | 3002 | Payment processing and URL generation. |
| job-payment-reconciler | 3004 | Reconciles local bookings with blockchain transactions. |
| job-blockchain-validation | 3006 | Monitors Ethereum events and stores them in the DB. |

## Prerequisites

- **Node.js**: v8.x or higher (due to older dependency versions).
- **MongoDB**: A running instance of MongoDB.
- **Ethereum Provider**: Infura account or a local Ethereum node for blockchain interaction.

## Getting Started

### 1. Database Setup
Restore the MongoDB database using the provided dumps:
```bash
mongorestore --db sdBT db-dump/
```

### 2. Install Dependencies
Each service has its own `package.json`. You need to install dependencies for each:
```bash
cd api-main && npm install
cd ../api-payment && npm install
cd ../job-blockchain-validation && npm install
cd ../job-payment-reconciler && npm install
```

### 3. Environment Configuration
Each service requires environment variables to be set. Copy the `.env.example` file to `.env` in each service directory and update the values with your actual secrets.

```bash
# Example for api-main
cp api-main/.env.example api-main/.env
# Update api-main/.env with your secrets
```

### 4. Smart Contract Deployment
The `solidity/merc.sol` contract should be deployed to an Ethereum network (the code currently points to Ropsten). Once deployed, update the `c_address` in `job-blockchain-validation/server.js`.

### 5. Running the Services
You can start each service using `node server.js` or `npm start` (where available):

```bash
# Start Main API
cd api-main && node server.js

# Start Payment Service
cd api-payment && node server.js

# Start Blockchain Monitor
cd job-blockchain-validation && node server.js

# Start Reconciler Job
cd job-payment-reconciler && node server.js
```

## Features

- **Logistics Engine**: High-performance distance calculation between global ports using geographic coordinates and automated shipping rate retrieval.
  - *Disclaimer*: Shipping rates and pricing quotes provided by the system are sample values and should be used for demonstration purposes only.
- **Blockchain-Powered Payments**: Immutable transaction tracking via Ethereum Smart Contracts (`ERC20`-like logic for recording shipment proofs-of-payment).
- **Microservices Architecture**: A decoupled ecosystem comprising four primary services, enabling independent scaling and localized fault tolerance.
- **Automated Blockchain Reconciliation**: Robust background workers that periodically synchronize off-chain MongoDB records with on-chain Ethereum events, ensuring absolute data consistency.

## Technical Deep Dive

### Security & Authentication
- **Stateless Authorization**: Implements `JSON Web Tokens (JWT)` for secure, stateless API access. Tokens are used for session management and authorizing logistics calculations.
- **Secure Payment Handoff**: Payment URLs are cryptographically signed with short-lived JWTs to prevent tampering and replay attacks during the checkout process.

### Blockchain Infrastructure
- **Smart Contract Governance**: Written in `Solidity (^0.4.15)`, the core contract manages shipment-to-payment mapping and emits `Transfering` events for real-time observability.
- **Event-Driven Monitoring**: The `job-blockchain-validation` service utilizes `Web3.js` to poll and subscribe to contract events, capturing transaction hashes and block metadata into a high-availability MongoDB store.
- **Ethereum Integration**: Pre-configured for the `Ropsten` testnet, with flexibility to connect to any Ethereum-compatible RPC node (via Infura or local nodes).

### Data Integrity & Reliability
- **Reconciliation Engine**: A specialized `job-payment-reconciler` continuously audits pending bookings against recorded blockchain transactions, handling edge cases like transaction timeouts or address mismatches.
- **Schema Validation**: Strict data modeling using `Mongoose` ensures consistency across the multi-service environment, especially for shared schemas like `trans-cloud-schema`.

### Frontend
For the frontend of this Application look at -> [BitlTracker](https://github.com/AbhiRoy96/BitlTracker).

## Important Notices

- **Company Logos**: All company logos located in `api-main/img/` (e.g., MAERSK, MSC, COSCO, etc.) are the property of their respective owners and are copyrighted by the concerned companies. Use of these logos is for illustrative purposes only.
- **Pricing Quotes**: As mentioned above, all pricing and shipping quotes are samples and do not represent actual market rates.

## License
MIT
