\# 🧠 Proof-of-Prompt

A blockchain-based web application that \*\*proves the authorship and originality of AI-generated content\*\* using decentralized identity and immutable registries.

Built for \*\*BlockQuest 2025\*\*, this project explores the intersection of \*\*AI, intellectual property protection, and blockchain verification\*\*.

\---

\## 🚀 Overview

\*\*Proof-of-Prompt\*\* allows users to:

\- Generate essays or creative content using AI.

\- Register their content immutably on the blockchain as proof of authorship.

\- Verify originality and timestamp through decentralized records.

The application integrates \*\*Supabase\*\* for backend management and \*\*MetaMask\*\* for blockchain identity verification — ensuring secure, verifiable authorship tracking for AI-generated works.

\---

\## 🧩 Core Concept

\> “Prove authorship/originality of AI-generated content using blockchain-based registries.”

This project addresses the challenge of \*\*intellectual property (IP) verification in the age of generative AI\*\*.

By leveraging \*\*blockchain transparency\*\* and \*\*AI prompt tracking\*\*, it ensures that creators can claim and protect ownership of their digital creations.

\---

\## 🪙 Blockchain Integration

To use this app, users must:

1\. Have the \*\*MetaMask browser extension\*\* installed.

2\. Connect their \*\*MetaMask wallet\*\* to the app.

3\. Use their wallet identity to sign and store content hashes on the blockchain for proof of authorship.

This ensures \*\*decentralized identity verification\*\* and \*\*tamper-proof content proofing\*\*.

\---

\## 🧠 Built With

| Category | Technologies |

|-----------|---------------|

| \*\*Frontend Framework\*\* | React 18 + TypeScript |

| \*\*Build Tool\*\* | Vite |

| \*\*Styling\*\* | Tailwind CSS + shadcn/ui |

| \*\*UI Components\*\* | Radix UI + Lucide React Icons |

| \*\*Routing\*\* | React Router DOM |

| \*\*Backend / Auth\*\* | Supabase |

| \*\*Blockchain Identity\*\* | MetaMask |

| \*\*Hosting & Development\*\* | Lovable (linked project) |

| \*\*Package Manager\*\* | Bun / npm |

\---

\## 📂 Project Structure

├── src/

│ ├── components/ # Reusable UI components

│ │ ├── Navigation.tsx # Main navigation bar

│ │ └── ui/ # shadcn/ui components

│ ├── hooks/ # Custom React hooks

│ │ ├── useAuth.tsx # Supabase auth logic

│ │ ├── use-toast.ts # Toast notifications

│ │ └── use-mobile.tsx # Device detection

│ ├── integrations/ # External service integrations

│ │ └── supabase/ # Supabase client setup

│ ├── lib/ # Utility functions

│ │ └── utils.ts # Helper utilities

│ ├── pages/ # Application pages

│ │ ├── Auth.tsx # Authentication UI

│ │ └── Generate.tsx # Content generation & blockchain proof

│ ├── App.tsx # Root component

│ └── main.tsx # App entry point

├── supabase/

│ ├── config.toml # Supabase configuration

│ ├── functions/ # Edge functions

│ └── migrations/ # Database schema

└── public/ # Static assets

yaml

Copy code

\---

\## ⚙️ Setup and Installation

\### Prerequisites

\- Node.js 18+ or Bun

\- Supabase account

\- MetaMask browser extension

\- Supabase CLI (optional)

\### Steps

1\. \*\*Clone the repository:\*\*

\`\`\`bash

git clone https://github.com/guptatapan-24/proof-of-prompt.git

cd proof-of-prompt

Install dependencies:

bash

Copy code

bun install

or

bash

Copy code

npm install

Configure environment variables:

Create a .env file in the root directory:

env

Copy code

VITE\_SUPABASE\_URL=your-supabase-url

VITE\_SUPABASE\_ANON\_KEY=your-supabase-anon-key

Start the development server:

bash

Copy code

bun run dev

or

bash

Copy code

npm run dev

Open in browser:

Visit → http://localhost:5173

🔗 MetaMask Integration

Before generating or verifying content:

Install MetaMask on your browser.

Connect your wallet when prompted.

The wallet address acts as your decentralized author identity.

Each content hash is stored on-chain to validate your authorship claim.

🧠 How It Works

User logs in using Supabase authentication.

AI generates essay/content based on prompts.

Content hash is created and linked to user’s MetaMask wallet.

Hash stored on blockchain to provide immutable proof of authorship.

Verification can be done later to confirm authorship using the same hash.

🧱 Scripts

CommandDescription

bun run devStart development server

bun run buildBuild for production

bun run previewPreview production build

bun run lintRun ESLint checks

🧰 Development Notes

Supabase Local Setup

Start Supabase locally with:

bash

Copy code

supabase start

Configuration: supabase/config.toml

Add New Components

Using shadcn/ui:

bash

Copy code

npx shadcn-ui@latest add \[component-name\]

🧑‍💻 Deployment

Run:

bash

Copy code

bun run build

Deploy the dist/ directory on:

Vercel

Netlify

Cloudflare Pages

AWS Amplify

Remember to add environment variables on your hosting platform.

📜 License

This project is licensed under the MIT License.

See the LICENSE file for details.

🏆 Credits

Built with ❤️ by Tapan Gupta and team for BlockQuest 2025.

Originally hosted and developed on Lovable.

Powered by Supabase, MetaMask, and React.
