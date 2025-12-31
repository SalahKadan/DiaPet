import { useAuth } from "@/hooks/use-auth";
import { usePets } from "@/hooks/use-pets";
import { CreatePetDialog } from "@/components/CreatePetDialog";
import { PetDashboard } from "./PetDashboard";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { data: pets, isLoading: petsLoading } = usePets();

  if (authLoading || petsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in UI (normally handled by protected route, but simple check here)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-6xl md:text-8xl mb-6 text-primary font-display font-bold">DiaPet</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md font-body">
          Your friendly buddy for learning diabetes management!
        </p>
        <Button 
          onClick={() => window.location.href = "/api/login"} 
          className="h-16 px-10 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/20 hover-elevate active-elevate-2"
        >
          Login to Play
        </Button>
      </div>
    );
  }

  // Logged in but no pet
  if (!pets || pets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" onClick={() => logout()}>Log Out</Button>
        </div>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-64 h-64 bg-card rounded-full mx-auto shadow-2xl border-4 border-dashed border-primary/20 flex items-center justify-center">
            <span className="text-6xl grayscale opacity-30">🐾</span>
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">Welcome, {user.firstName || 'Friend'}!</h2>
            <p className="text-muted-foreground mb-8">Ready to adopt your new best friend?</p>
            <CreatePetDialog />
          </div>
        </div>
      </div>
    );
  }

  // Has pet - show dashboard for first pet
  return (
    <div className="min-h-screen bg-background">
      <main>
        <PetDashboard pet={pets[0]} />
      </main>
    </div>
  );
}
