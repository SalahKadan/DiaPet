import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePet } from "@/hooks/use-pets";
import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";

export function CreatePetDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { mutate, isPending } = useCreatePet();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    mutate(
      { name, type: "cat" }, // Default to cat for now
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-2xl btn-bounce bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8">
          <PlusCircle className="mr-2 h-6 w-6" />
          Adopt a Pet
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-2xl max-w-sm bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center pb-2">Name Your Friend</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-lg ml-1">Pet Name</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Fluffy"
              className="text-xl p-6 rounded-xl border-2 border-slate-200 focus-visible:ring-primary focus-visible:border-primary" 
            />
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !name.trim()} 
            className="w-full h-14 text-xl rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Start Adventure!"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
