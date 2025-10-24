import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, CheckCircle2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ProofChain
            </Link>
            
            <div className="flex gap-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
              
              {user && (
                <>
                  <Button
                    variant={isActive("/generate") ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to="/generate">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Link>
                  </Button>
                  
                  <Button
                    variant={isActive("/verify") ? "default" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to="/verify">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Verify
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          <div>
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
