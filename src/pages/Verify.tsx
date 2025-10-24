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
import { ethers } from "ethers";
import { Navigation } from "@/components/Navigation";

interface Proof {
  id: string;
  hash: string;
  prompt: string;
  content_snippet: string;
  generation_timestamp: string;
  tx_hash?: string;
  status: "verified" | "pending" | "failed";
}

// IMPORTANT: After deploying, replace with YOUR deployed contract address from Step 4
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";

const CONTRACT_ABI = [
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
  }
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
    if (user) {
      loadProofs();
    }
  }, [user]);

  const loadProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('user_id', user!.id)
        .order('generation_timestamp', { ascending: false });

      if (error) {
        console.error('Error loading proofs:', error);
        toast.error("Failed to load proofs");
        return;
      }

      setProofs((data || []) as Proof[]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load proofs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchHash) {
      toast.error("Please enter a hash to search");
      return;
    }

    try {
      // Search in database
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('hash', searchHash)
        .single();

      if (error) {
        toast.error("Proof not found in database");
        return;
      }

      // Optionally verify on-chain if contract is deployed
      if (CONTRACT_ADDRESS !== "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const result = await contract.verifyProof(searchHash);
        
        if (!result.exists) {
          toast.warning("Proof found in database but not verified on-chain");
        } else {
          toast.success(`Proof verified on-chain! Owner: ${result.owner}`);
        }
      } else {
        toast.success("Proof found in database!");
      }

      setProofs([data as Proof]);
    } catch (error) {
      console.error(error);
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
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">⏳</div>
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
            <CardDescription>
              Enter a proof hash to verify its authenticity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Proof Hash</Label>
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
            <CardDescription>
              All registered proofs linked to your account
            </CardDescription>
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
                            variant={proof.status === "verified" ? "default" : "secondary"}
                            className="flex items-center gap-1 w-fit"
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
