import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Hash, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";
import { Navigation } from "@/components/Navigation";

// IMPORTANT: After deploying, replace with YOUR deployed contract address from Step 4
const CONTRACT_ADDRESS = "0x9F0441CF54141D58c6DF739ffEFd31C50977035c";

const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_contentHash", "type": "string"}],
    "name": "registerProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "_contentHash", "type": "string"}],
    "name": "verifyProof",
    "outputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "exists", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "string", "name": "contentHash", "type": "string"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "ProofRegistered",
    "type": "event"
  }
];

const Generate = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to generate content");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const validatePrompt = (text: string): boolean => {
    if (text.length < 10 || text.length > 5000) {
      toast.error("Prompt must be between 10 and 5000 characters");
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validatePrompt(prompt)) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { prompt }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (error.message.includes('402')) {
          toast.error("AI credits exhausted. Please add credits.");
        } else {
          toast.error("Failed to generate content");
        }
        console.error(error);
        return;
      }

      setGeneratedContent(data.content);
      setContentHash(data.hash);
      setTimestamp(data.timestamp);
      
      // Save to database
      const contentSnippet = data.content.substring(0, 200);
      await supabase.from('proofs').insert({
        user_id: user!.id,
        prompt,
        content_snippet: contentSnippet,
        hash: data.hash,
        status: 'pending'
      });

      toast.success("Content generated and proof created!");
    } catch (error) {
      toast.error("Failed to generate content");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegisterOnChain = async () => {
    if (!contentHash) {
      toast.error("Please generate content first");
      return;
    }

    setIsRegistering(true);
    try {
      if (!(window as any).ethereum) {
        toast.error("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Check network (Ethereum Sepolia = 11155111)
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        try {
          // Try to switch to Sepolia
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
          });
          toast.success("Switched to Sepolia network");
        } catch (switchError: any) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            try {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Ethereum Sepolia',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
              toast.success("Sepolia network added and switched");
            } catch (addError) {
              toast.error("Failed to add Sepolia network");
              return;
            }
          } else {
            toast.error("Please switch to Ethereum Sepolia testnet in MetaMask");
            return;
          }
        }
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      toast.loading("Estimating gas...");
      const gasEstimate = await contract.registerProof.estimateGas(contentHash);
      
      toast.loading("Confirm transaction in MetaMask...");
      const tx = await contract.registerProof(contentHash, {
        gasLimit: gasEstimate * 120n / 100n
      });

      toast.loading("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();

      // Update database with transaction hash
      await supabase
        .from('proofs')
        .update({ 
          tx_hash: receipt.hash,
          status: 'verified'
        })
        .eq('hash', contentHash);

      toast.success("Proof registered on-chain successfully!");
      navigate("/verify");
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Transaction rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient ETH for gas fees");
      } else {
        toast.error("Failed to register on-chain");
      }
      console.error(error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="p-4">
      <div className="container mx-auto max-w-5xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Generate & Prove
          </h1>
          <p className="text-muted-foreground">
            Create AI content and register immutable proof on the blockchain
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Prompt
              </CardTitle>
              <CardDescription>
                Describe what you want AI to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Write a creative essay about the future of AI..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground">
                  {prompt.length} / 5000 characters
                </p>
              </div>
              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                variant="hero"
                disabled={isGenerating || !prompt}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Generated Content
              </CardTitle>
              <CardDescription>
                AI-generated output and proof hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={generatedContent}
                  readOnly
                  className="min-h-[150px] resize-none bg-muted/50"
                  placeholder="Generated content will appear here..."
                />
              </div>
              
              {contentHash && (
                <div className="space-y-2">
                  <Label htmlFor="hash">Proof Hash</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hash"
                      value={contentHash}
                      readOnly
                      className="font-mono text-xs bg-muted/50"
                    />
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(contentHash);
                        toast.success("Hash copied!");
                      }}
                    >
                      <Hash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleRegisterOnChain} 
                variant="hero"
                className="w-full"
                disabled={!contentHash || isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register On-Chain"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Generate;
