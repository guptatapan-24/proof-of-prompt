import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Proof {
  id: string;
  hash: string;
  prompt: string;
  contentSnippet: string;
  timestamp: string;
  txHash?: string;
  status: "verified" | "pending" | "unverified";
}

const Verify = () => {
  const [searchHash, setSearchHash] = useState("");
  const [proofs, setProofs] = useState<Proof[]>([
    {
      id: "1",
      hash: "0x1234...abcd",
      prompt: "Write an essay about AI creativity",
      contentSnippet: "In the realm of artificial intelligence...",
      timestamp: "2025-01-15 14:30:00",
      txHash: "0x9876...5432",
      status: "verified"
    },
    {
      id: "2",
      hash: "0x5678...efgh",
      prompt: "Create a poem about blockchain",
      contentSnippet: "Immutable chains of trust...",
      timestamp: "2025-01-14 09:15:00",
      status: "pending"
    }
  ]);

  const handleSearch = async () => {
    if (!searchHash) {
      toast.error("Please enter a hash to search");
      return;
    }

    try {
      // TODO: Query Supabase and blockchain for proof
      toast.info("Search functionality coming soon!");
    } catch (error: any) {
      toast.error(error.message || "Search failed");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      default:
        return "destructive";
    }
  };

  return (
    <div className="min-h-screen p-4">
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
                  placeholder="0x1234abcd..."
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>TX Hash</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proofs.map((proof) => (
                  <TableRow key={proof.id}>
                    <TableCell>
                      <Badge 
                        variant={getStatusColor(proof.status) as any}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(proof.status)}
                        {proof.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {proof.hash}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {proof.prompt}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">
                      {proof.contentSnippet}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {proof.timestamp}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {proof.txHash || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(proof.hash, "Hash")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {proofs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No proofs found. Create your first proof!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;
