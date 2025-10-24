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

// ✅ Deployed Sepolia contract
const CONTRACT_ADDRESS = "0x4252A005C702A11D8C1F8f250c71fCd8eC264d20";

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: "bytes32", name: "_hash", type: "bytes32" }],
    name: "registerProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_hash", type: "bytes32" }],
    name: "verifyProof",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "hash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "ProofRegistered",
    type: "event",
  },
];

const Generate = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentHash, setContentHash] = useState("");
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
    const { data, error } = await supabase.functions.invoke("generate-content", {
      body: { prompt },
    });

    if (error) {
      toast.error(error.message || "Failed to generate content");
      return;
    }

    setGeneratedContent(data.content);
    // ✅ Use the backend-generated hash instead of computing locally
    const hash = data.hash;
    setContentHash(hash);

    const snippet = data.content.substring(0, 200);
    await supabase.from("proofs").insert({
      user_id: user!.id,
      prompt,
      content_snippet: snippet,
      hash,
      status: "pending",
    });

    toast.success("Content generated successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate content");
  } finally {
    setIsGenerating(false);
  }
};

  const handleRegisterOnChain = async () => {
  if (!contentHash) {
    toast.error("Please generate content first");
    return;
  }

  try {
    setIsRegistering(true);

    if (!(window as any).ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    // Ensure Sepolia network
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia
        });
        toast.success("Switched to Sepolia network");
      } catch (err: any) {
        if (err.code === 4902) {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Ethereum Sepolia",
                nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          toast.success("Sepolia added and switched");
        } else {
          toast.error("Please switch MetaMask to Sepolia");
          return;
        }
      }
    }

    // Verify contract exists
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === "0x") {
      toast.error("Contract not found at address — please verify deployment.");
      return;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // ✅ Convert hash to proper bytes32 format
    const hashBytes32 = "0x" + contentHash;

    // Check if proof already exists
    const owner = await contract.verifyProof(hashBytes32);
    if (owner !== ethers.ZeroAddress) {
      toast.warning("Proof already exists on-chain!");
      return;
    }

    // Register proof
    const gasEstimate = await contract.registerProof.estimateGas(hashBytes32);
    const tx = await contract.registerProof(hashBytes32, {
      gasLimit: (gasEstimate * 120n) / 100n,
    });

    toast.info("Transaction submitted... please wait.");
    await tx.wait();

    // Update Supabase
    await supabase
      .from("proofs")
      .update({ tx_hash: tx.hash, status: "verified" })
      .eq("hash", contentHash);

    toast.success("✅ Proof successfully registered on Sepolia!");
    navigate("/verify");
  } catch (err: any) {
    console.error(err);
    if (err.code === 4001) toast.error("Transaction rejected by user");
    else if (err.message?.includes("insufficient funds"))
      toast.error("Insufficient ETH for gas fees");
    else toast.error("Failed to register proof");
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
            {/* Prompt Input */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Prompt
                </CardTitle>
                <CardDescription>Describe your AI idea</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Write your creative prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} / 5000 characters
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  className="w-full"
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
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Generated Content
                </CardTitle>
                <CardDescription>View content and blockchain proof</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea
                    value={generatedContent}
                    readOnly
                    className="min-h-[150px] bg-muted/50"
                    placeholder="Generated content will appear here..."
                  />
                </div>

                {contentHash && (
                  <div className="space-y-2">
                    <Label>Proof Hash</Label>
                    <div className="flex gap-2">
                      <Input
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
