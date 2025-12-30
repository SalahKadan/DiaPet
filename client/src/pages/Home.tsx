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
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Not logged in UI (normally handled by protected route, but simple check here)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4 text-center">
        <h1 className="text-5xl md:text-7xl mb-6 text-primary drop-shadow-sm">SugarPet</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md">
          Learn to manage diabetes with your own virtual friend! Feed, play, and check levels together.
        </p>
        <Button 
          onClick={() => window.location.href = "/api/login"} 
          className="bg-primary hover:bg-primary/90 text-white text-xl px-10 py-6 rounded-2xl shadow-xl shadow-primary/20 btn-bounce"
        >
          Login to Play
        </Button>
      </div>
    );
  }

  // Logged in but no pet
  if (!pets || pets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" onClick={() => logout()}>Log Out</Button>
        </div>
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-64 h-64 bg-white rounded-full mx-auto shadow-xl border-4 border-dashed border-gray-200 flex items-center justify-center">
            <span className="text-6xl grayscale opacity-30">🐱</span>
          </div>
          <div>
            <h2 className="text-3xl mb-2">Welcome, {user.firstName || user.username}!</h2>
            <p className="text-gray-500 mb-8">You don't have a pet yet. Let's adopt one!</p>
            <CreatePetDialog />
          </div>
        </div>
      </div>
    );
  }

  // Has pet - show dashboard for first pet
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display text-primary">SugarPet</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-500 font-bold">
            Player: {user.firstName}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="rounded-full hover:bg-slate-100"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </Button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <PetDashboard pet={pets[0]} />
      </main>
    </div>
  );
}
