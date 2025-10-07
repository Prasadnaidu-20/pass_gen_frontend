Password Generator + Secure Vault (MVP)

Tech Stack:

Frontend: Next.js + TypeScript

Backend: Node.js + Express

Database: MongoDB

Client-side Encryption: CryptoJS

Features:

User Authentication (email + password, JWT)

Generate strong passwords with length slider and symbols

Secure Vault: Add, view, edit, delete items (title, username, password, URL, notes)

Client-side encryption so server never stores plaintext

Copy password to clipboard with auto-clear

How to Run:

Backend:

cd backend
npm install
npm start

Runs on http://localhost:5000

Frontend:

cd password_generator
npm install
npm run dev

Runs on http://localhost:3000

Backend .env

PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>


Frontend .env.local

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENCRYPTION_KEY=<your-secret-key>
