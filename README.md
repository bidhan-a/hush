# Hush

Hush is a privacy protocol on Solana, enabling private transactions powered by zero-knowledge proofs. 

## Overview

Hush allows users to:

- Deposit tokens into fixed-sized pools, generating an encrypted note off-chain.
- Share the note with a recipient through any private channel.
- Use the note to create a zero-knowledge proof at withdrawal, which the program verifies before releasing funds.

This approach breaks the on-chain link between deposits and withdrawals, ensuring strong anonymity and privacy while preserving Solana's speed and security.


## Project Structure

```
├── circuits/           # Circom circuits, verification keys, and proof artifacts
├── programs/           # Solana program
├── scripts/            # Utility scripts (build, ops, key management)
├── tests/              # Solana program tests
├── ui/                 # Next.js frontend
```

## Getting Started

### Prerequisites

- Node.js and npm
- Rust and Cargo
- Solana CLI tools
- Docker
- Circom
- snarkjs

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/bidhan-a/hush.git
   cd hush
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Build Anchor Program:**
   ```sh
   anchor build
   ```

4. **Start Local Solana Validator:**
   ```sh
   solana-test-validator
   ```

5. **Deploy Program:**
   ```sh
   anchor deploy
   ```

6. **Run Postgres container:**
   ```sh
   docker-compose up
   ```

7. **Run the UI:**
   ```sh
   cd ui
   npm install
   npm run dev
   ```

## Testing

The program tests are located in [tests/hush.ts](tests/hush.ts) and cover all major flows: initialization, pool creation, deposit, and withdrawal.

Run tests with:
```sh
anchor test
```

## Deployment

The Solana program is deployed to Devnet at address `CkevGEmkCSpN3SgS9ptG42qL42vV4aTS8NrhDx29sxF3`.

The frontend can be accessed [here](https://hush-nu.vercel.app/).


## ⚠️ Disclaimer

This program is currently unaudited and intended for use on Solana devnet only.

Additionally, the Powers of Tau ceremony required for the zk-SNARK setup was performed locally, and should not be considered secure for production use. For any future deployment to mainnet, a trusted setup with proper ceremony coordination and verification is essential.

## License

MIT
