import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ethers, zeroPadValue } from "ethers";
import { Navigation } from "@/components/Navigation";
// import { hexZeroPad } from "@ethersproject/bytes";

interface Proof {
  id: string;
  hash: string;
  prompt: string;
  content_snippet: string;
  generation_timestamp: string;
  tx_hash?: string;
  status: "verified" | "pending" | "failed";
}

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

const Verify = () => {
  const [searchHash, setSearchHash] = useState("");
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to view proofs");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) loadProofs();
  }, [user]);

  const loadProofs = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase
      .from("proofs")
      .select("*")
      .eq("user_id", user!.id)
      .order("generation_timestamp", { ascending: false });

    if (error) {
      console.error("Error loading proofs:", error);
      toast.error("Failed to load proofs");
      return;
    }

    let proofsData = (data || []) as Proof[];

    // On-chain verification
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        toast.warning("Switch MetaMask to Sepolia to verify on-chain status.");
      } else {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        for (let i = 0; i < proofsData.length; i++) {
          try {
            // Ensure hash has 0x prefix
            const hash = proofsData[i].hash.startsWith("0x")
              ? proofsData[i].hash
              : "0x" + proofsData[i].hash;

            const hashBytes32 = zeroPadValue(hash, 32);

            const owner = await contract.verifyProof(hashBytes32);

            console.log(`Hash: ${hash}, Owner: ${owner}`);

            proofsData[i].status =
              owner === ethers.ZeroAddress ? "pending" : "verified";
          } catch (err) {
            console.error(`Error verifying proof ${proofsData[i].hash} on-chain:`, err);
            proofsData[i].status = "failed";
          }
        }
      }
    } else {
      toast.info("MetaMask not detected, on-chain verification skipped.");
    }

    setProofs(proofsData);
  } catch (err) {
    console.error(err);
    toast.error("Failed to load proofs");
  } finally {
    setIsLoading(false);
  }
};


  // import { ethers, hexZeroPad } from "ethers"; // ✅ import hexZeroPad directly

const handleSearch = async () => {
  if (!searchHash) {
    toast.error("Please enter a hash to search");
    return;
  }

  // Normalize hash to lowercase
  let normalizedHash = searchHash.toLowerCase();
  if (normalizedHash.startsWith("0x")) {
    normalizedHash = normalizedHash.slice(2); // remove 0x for DB lookup
  }

  if (!/^[a-f0-9]{64}$/.test(normalizedHash)) {
    toast.error("Please enter a valid 32-byte hash (with or without 0x prefix)");
    return;
  }

  try {
    // DB lookup WITHOUT 0x
    const { data, error } = await supabase
      .from("proofs")
      .select("*")
      .eq("hash", normalizedHash)
      .single();

    if (error || !data) {
      toast.error("Proof not found in database");
      return;
    }

    let updatedProof = data as Proof;

    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        toast.warning("Please switch MetaMask to Ethereum Sepolia Testnet!");
      } else {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        try {
          // On-chain verification REQUIRES 0x prefix
          const onChainHash = "0x" + normalizedHash;
          const owner = await contract.verifyProof(zeroPadValue(onChainHash, 32));

          if (owner === ethers.ZeroAddress) {
            toast.warning("Proof exists in DB but not registered on-chain.");
            updatedProof.status = "pending";
          } else {
            toast.success(`✅ Proof verified on-chain! Owner: ${owner}`);
            updatedProof.status = "verified";
          }
        } catch (err) {
          console.error("Error verifying on-chain:", err);
          toast.error("Failed to verify proof on-chain");
        }
      }
    } else {
      toast.info("MetaMask not detected, verifying locally only.");
    }

    setProofs([updatedProof]);
  } catch (err) {
    console.error(err);
    toast.error("Error searching for proof");
  }
};



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hash copied to clipboard!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-primary text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Verification Dashboard
            </h1>
            <p className="text-muted-foreground">
              Query and verify proof ownership across blockchain and database
            </p>
          </div>

          {/* Search Card */}
          <Card className="gradient-card shadow-card border-0 mb-8">
            <CardHeader>
              <CardTitle>Search Proof</CardTitle>
              <CardDescription>Enter a proof hash to verify its authenticity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Proof Hash
                  </Label>
                  <Input
                    id="search"
                    placeholder="Enter hash..."
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleSearch} variant="hero">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Proofs Table */}
          <Card className="gradient-card shadow-card border-0">
            <CardHeader>
              <CardTitle>Your Proofs</CardTitle>
              <CardDescription>All registered proofs linked to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading proofs...
                        </TableCell>
                      </TableRow>
                    ) : proofs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No proofs found. Generate your first proof!
                        </TableCell>
                      </TableRow>
                    ) : (
                      proofs.map((proof) => (
                        <TableRow key={proof.id}>
                          <TableCell className="font-mono text-xs">
                            {proof.hash.substring(0, 16)}...
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{proof.prompt}</TableCell>
                          <TableCell className="max-w-md truncate text-muted-foreground">
                            {proof.content_snippet}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(proof.generation_timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`flex items-center gap-1 w-fit ${
    proof.status === "verified" ? "bg-white text-black" : "bg-gray-200 text-gray-700"
  }`}
                            >
                              {getStatusIcon(proof.status)}
                              {proof.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(proof.hash)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Verify;
