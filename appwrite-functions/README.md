# Appwrite Functions

Serverless functions for backend operations.

## Functions List

### 1. create-razorpay-order
Creates a Razorpay order when customer initiates payment.

**Trigger:** HTTP POST  
**Runtime:** Node.js 18  
**Path:** `/create-razorpay-order`

### 2. razorpay-webhook
Handles Razorpay payment webhook to verify and update order status.

**Trigger:** HTTP POST  
**Runtime:** Node.js 18  
**Path:** `/razorpay-webhook`

### 3. send-email
Sends transactional emails (order confirmation, status updates, etc.).

**Trigger:** Event (database update) or HTTP  
**Runtime:** Node.js 18

## Setup Instructions

### 1. Install Appwrite CLI

```bash
npm install -g appwrite-cli
```

### 2. Login to Appwrite

```bash
appwrite login
```

### 3. Initialize Functions

```bash
cd appwrite-functions

# For each function:
appwrite init function
```

### 4. Deploy Functions

```bash
appwrite deploy function
```

## Development

Functions will be implemented in Phase 2. For now, these are placeholders.

Refer to individual function READMEs for implementation details (coming in Phase 2).
