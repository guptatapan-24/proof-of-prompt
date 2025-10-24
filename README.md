# 🧠 Proof-of-Prompt

A blockchain-based web application that **proves the authorship and originality of AI-generated content** using decentralized identity and immutable registries.  
Built for **BlockQuest 2025**, this project explores the intersection of **AI, intellectual property protection, and blockchain verification**.

---

## 🚀 Overview

**Proof-of-Prompt** empowers users to:
- 🧾 Generate AI-based essays or creative content.
- 🪪 Register their content immutably on the blockchain as proof of authorship.
- 🔍 Verify originality and timestamp through decentralized records.

The app integrates **Supabase** for backend management and **MetaMask** for blockchain identity verification — ensuring **secure, verifiable authorship tracking** for AI-generated works.  
Originally built and hosted on **Lovable**, it is now linked to a personal Supabase instance.

---

## 🧩 Core Concept

> “Prove authorship/originality of AI-generated content using blockchain-based registries.”

This project addresses the challenge of **intellectual property (IP) verification** in the era of generative AI.  
By combining **blockchain transparency** with **AI prompt tracking**, it ensures creators can **claim, timestamp, and protect** ownership of their digital creations.

---

## 🪙 Blockchain Integration

To use this app:
1. Install the **MetaMask browser extension**.
2. Create or connect your **MetaMask wallet**.
3. Use your wallet identity to sign and store content hashes on the blockchain.
4. Each entry acts as **immutable proof of authorship** and originality.

---

## 🧠 Built With

| Category | Technologies |
|-----------|---------------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **UI Components** | Radix UI + Lucide React |
| **Routing** | React Router DOM |
| **Backend / Auth** | Supabase |
| **Blockchain Identity** | MetaMask |
| **Hosting** | Lovable |
| **Package Manager** | Bun / npm |

---

## 📂 Project Structure

```bash
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navigation.tsx # Main navigation bar
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.tsx    # Supabase authentication
│   │   ├── use-toast.ts   # Toast notifications
│   │   └── use-mobile.tsx # Mobile detection
│   ├── integrations/      # External service integrations
│   │   └── supabase/      # Supabase client setup
│   ├── lib/               # Utility functions
│   │   └── utils.ts       # Helper utilities
│   ├── pages/             # Application pages
│   │   ├── Auth.tsx       # Authentication UI
│   │   └── Generate.tsx   # AI content generation + blockchain proof
│   ├── App.tsx            # Root component
│   └── main.tsx           # Application entry point
├── supabase/
│   ├── config.toml        # Supabase configuration
│   ├── functions/         # Edge functions
│   └── migrations/        # Database schema
└── public/                # Static assets
```
---

## ⚙️ Setup and Installation

### 🧾 Prerequisites

- Node.js 18+ or Bun  
- Supabase account  
- MetaMask browser extension  
- Supabase CLI *(optional for local testing)*

### 🧩 Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guptatapan-24/proof-of-prompt.git
   cd proof-of-prompt
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   VITE_SUPABASE_PROJECT_ID=your-supabase-project-id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:8080
   ```

## 🔗 MetaMask Integration

Before generating or registering content:

1. Ensure MetaMask extension is installed and unlocked
2. Connect your wallet when prompted
3. Your wallet address becomes your decentralized author identity
4. Each generated content's hash is signed and stored on-chain for verification

## 🧠 How It Works

1. The user logs in via Supabase authentication
2. The user inputs a prompt and AI generates content
3. The generated content's hash is created locally
4. The MetaMask wallet signs this hash and stores it on the blockchain
5. This blockchain entry becomes a permanent authorship record
6. Anyone can later verify authorship by comparing the hash

## 🧱 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint code checks |

## 🧰 Developer Notes

### Supabase Local Setup

Run Supabase locally for testing:

```bash
supabase start
```

Configuration: `supabase/config.toml`

### Add New Components

Using shadcn/ui:

```bash
npx shadcn-ui@latest add [component-name]
```

## ✏️ Editing the Project

### Use Your Preferred IDE

Clone the repo and push changes. Pushed changes will also be reflected in Lovable.

### Edit Directly in GitHub

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon)
- Make your changes and commit

### Use GitHub Codespaces

- Navigate to the main page of your repository
- Click on the "Code" button (green button)
- Select the "Codespaces" tab
- Click on "New codespace"
- Edit files directly within the Codespace

## 🚀 Deployment

1. **Build for production:**
   ```bash
   bun run build
   ```

2. **Preview the build:**
   ```bash
   bun run preview
   ```

3. **Deploy the `dist/` folder** on your preferred platform:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - AWS Amplify


4. **Set environment variables** (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) in your hosting dashboard.
   

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🏆 Credits

Built with ❤️ by **Tapan Gupta** for **BlockQuest 2025**.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---
