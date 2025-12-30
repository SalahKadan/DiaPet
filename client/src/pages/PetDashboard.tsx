import { Pet } from "@shared/schema";
import { usePetAction, useUpdateBloodSugar, useChat } from "@/hooks/use-pets";
import { PetAvatar } from "@/components/PetAvatar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { FoodSelector } from "@/components/FoodSelector";
import { InsulinControl } from "@/components/InsulinControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Heart, Zap, Utensils, Moon, Sun, MessageCircle, Activity, Stethoscope, Gamepad2, Syringe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PetDashboardProps {
  pet: Pet;
}

export function PetDashboard({ pet }: PetDashboardProps) {
  const { mutate: performAction, isPending: actionPending } = usePetAction();
  const { mutate: updateSugar, isPending: sugarPending } = useUpdateBloodSugar();
  const { mutate: sendChat, isPending: chatPending } = useChat();

  const [chatOpen, setChatOpen] = useState(false);
  const [bloodTestOpen, setBloodTestOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'pet', text: string}[]>([]);

  const bloodTestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/blood-test`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      setBloodTestOpen(false);
    }
  });

  const handleAction = (type: 'feed' | 'insulin' | 'sleep' | 'wake' | 'play', extra?: any) => {
    performAction({ id: pet.id, type, ...extra });
  };

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput("");
    sendChat({ petId: pet.id, message: userMsg }, {
      onSuccess: (data) => {
        setChatHistory(prev => [...prev, { role: 'pet', text: data.message }]);
      }
    });
  };

  const experiencePercent = pet.experience || 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden p-4">
      <div className="relative w-full max-w-[450px] aspect-[9/19] bg-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5">
        
        <AnimatePresence>
          {pet.activeScenario && (
            <motion.div 
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="absolute top-0 inset-x-0 z-50 bg-primary/90 backdrop-blur-md p-4 text-center text-primary-foreground font-bold"
            >
              <p className="text-xs uppercase tracking-widest mb-1">New Challenge!</p>
              <p className="text-sm">{pet.scenarioDescription || "Something is happening! Check your sugar levels."}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-12 left-4 right-4 z-20 grid grid-cols-2 gap-4 h-32">
          <div className="flex flex-col gap-2">
            <StatusIndicator label="HP" value={pet.health} icon={<Heart className="w-3 h-3 text-pink-500" />} colorClass="bg-pink-500" className="h-8" />
            <StatusIndicator label="NRG" value={pet.energy} icon={<Zap className="w-3 h-3 text-yellow-500" />} colorClass="bg-yellow-500" className="h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <StatusIndicator label="FOOD" value={pet.hunger} icon={<Utensils className="w-3 h-3 text-orange-500" />} colorClass="bg-orange-500" className="h-8" />
            <StatusIndicator label="BS" value={pet.bloodSugar} max={300} icon={<Activity className="w-3 h-3 text-red-500" />} type="bloodSugar" className="h-8" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative bg-gradient-to-b from-primary/5 to-transparent">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full px-8">
            <PetAvatar pet={pet} className="w-full max-w-[280px] mx-auto drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]" />
          </motion.div>
          <div className="absolute bottom-32 left-0 right-0 px-6 flex justify-between items-center">
            <Button size="icon" variant="secondary" className="w-14 h-14 rounded-2xl shadow-lg hover-elevate" onClick={() => handleAction(pet.isAsleep ? 'wake' : 'sleep')} disabled={actionPending}>
              {pet.isAsleep ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-2xl shadow-lg hover-elevate" disabled={pet.isAsleep || actionPending}>
                  <Utensils className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-white/10">
                <h2 className="text-xl font-display text-center mb-4">Pick a Snack!</h2>
                <FoodSelector onSelect={(foodId) => handleAction('feed', { foodId })} disabled={actionPending} />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-2xl shadow-lg hover-elevate" disabled={pet.isAsleep || actionPending}>
                  <Activity className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-white/10">
                <h2 className="text-xl font-display text-center mb-4">Insulin Pump</h2>
                <InsulinControl currentBloodSugar={pet.bloodSugar} isPending={actionPending} onAdminister={(units) => handleAction('insulin', { insulinUnits: units })} />
              </DialogContent>
            </Dialog>
            <Button size="icon" variant="secondary" className="w-14 h-14 rounded-2xl shadow-lg hover-elevate" onClick={() => setChatOpen(!chatOpen)}>
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="h-20 bg-muted/30 backdrop-blur-md flex items-center justify-around border-t border-white/5">
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate" onClick={() => handleAction('play')} disabled={actionPending || pet.isAsleep}>
            <Gamepad2 className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate" onClick={() => setBloodTestOpen(true)}>
            <Syringe className="w-6 h-6" />
          </Button>
          <div className="flex flex-col items-center">
            <AnimatePresence>
              {pet.experience >= 90 && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="absolute -top-12 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-bold shadow-lg"
                >
                  LVL UP SOON!
                </motion.div>
              )}
            </AnimatePresence>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold shadow-inner">
              LV{pet.level || 1}
            </div>
            <div className="w-10 h-1 bg-muted rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-primary" style={{ width: `${experiencePercent}%` }} />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate">
             <Stethoscope className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate">
             <Zap className="w-6 h-6" />
          </Button>
        </div>

        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-0 z-50 bg-card flex flex-col pt-12">
              <div className="px-6 flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">Ask {pet.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                  <Zap className="rotate-45" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-[1.5rem] text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
                    {msg.text}
                  </div>
                ))}
                {chatPending && <div className="text-xs text-muted-foreground animate-pulse">Thinking...</div>}
              </div>
              <form onSubmit={handleChat} className="p-6 bg-muted/30 flex gap-2">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Say something..." className="rounded-2xl h-14 bg-card border-none" />
                <Button type="submit" size="icon" className="w-14 h-14 rounded-2xl shrink-0" disabled={chatPending}>
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </form>
            </motion.div>
          )}

          {bloodTestOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-8">
                <Syringe className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Time for a Check!</h2>
              <p className="text-muted-foreground mb-8 max-w-xs">
                Checking your blood sugar helps us know if your buddy needs more energy or a little insulin!
              </p>
              <div className="bg-card p-6 rounded-3xl w-full mb-8 shadow-xl">
                 <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Reading...</p>
                 <p className="text-5xl font-bold text-primary">{pet.bloodSugar} mg/dL</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button size="lg" className="h-16 rounded-2xl text-xl font-bold" onClick={() => bloodTestMutation.mutate()} disabled={bloodTestMutation.isPending}>
                  {bloodTestMutation.isPending ? "Testing..." : "Finish Test"}
                </Button>
                <Button variant="ghost" onClick={() => setBloodTestOpen(false)} disabled={bloodTestMutation.isPending}>
                  Not now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
