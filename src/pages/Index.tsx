import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Fingerprint, Database, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-end mb-4">
            {user ? (
              <Button variant="ghost" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 animate-fade-in">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Blockchain-Verified AI Proofs</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Proof-of-Prompt
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Register and verify AI-generated content with immutable blockchain proofs.
            Protect your creative work with cryptographic certainty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button asChild variant="hero" size="xl">
              <Link to={user ? "/generate" : "/auth"}>
                {user ? "Generate Proof" : "Get Started"} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/verify">
                Verify Proof
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-24 grid md:grid-cols-3 gap-8">
          <div className="gradient-card rounded-xl p-8 shadow-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Generate & Hash</h3>
            <p className="text-muted-foreground">
              Use Lovable AI to generate content from your prompts. 
              Each creation gets a unique SHA256 hash combining prompt, timestamp, and user ID.
            </p>
          </div>

          <div className="gradient-card rounded-xl p-8 shadow-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">On-Chain Registry</h3>
            <p className="text-muted-foreground">
              Anchor your proof on Polygon blockchain with low gas fees. 
              Smart contract creates an immutable record linking your hash to your wallet.
            </p>
          </div>

          <div className="gradient-card rounded-xl p-8 shadow-card animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verify Ownership</h3>
            <p className="text-muted-foreground">
              Query both off-chain metadata and on-chain proofs. 
              Dashboard displays verification status with copy-to-claim functionality.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="space-y-6">
            {[
              { step: "01", title: "Authenticate", desc: "Sign in with email/password or connect your MetaMask wallet" },
              { step: "02", title: "Generate Content", desc: "Input your prompt and let AI create unique content for you" },
              { step: "03", title: "Create Proof", desc: "System generates SHA256 hash and stores metadata securely" },
              { step: "04", title: "Register On-Chain", desc: "Anchor your proof to Polygon blockchain with one click" },
              { step: "05", title: "Verify & Share", desc: "Access your verification dashboard to prove ownership anytime" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start glass-effect rounded-lg p-6 transition-smooth hover:bg-white/10">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
                  <span className="text-lg font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
