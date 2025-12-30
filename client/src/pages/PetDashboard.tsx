import { Pet } from "@shared/schema";
import { usePetAction, useUpdateBloodSugar, useChat } from "@/hooks/use-pets";
import { PetAvatar } from "@/components/PetAvatar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { FoodSelector } from "@/components/FoodSelector";
import { InsulinControl } from "@/components/InsulinControl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Heart, Zap, Utensils, Moon, Sun, MessageCircle, Activity, Stethoscope, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PetDashboardProps {
  pet: Pet;
}

export function PetDashboard({ pet }: PetDashboardProps) {
  const { mutate: performAction, isPending: actionPending } = usePetAction();
  const { mutate: updateSugar, isPending: sugarPending } = useUpdateBloodSugar();
  const { mutate: sendChat, isPending: chatPending } = useChat();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'pet', text: string}[]>([]);
  const [monitorValue, setMonitorValue] = useState(pet.bloodSugar);

  const handleAction = (type: 'feed' | 'insulin' | 'sleep' | 'wake' | 'play', extra?: any) => {
    performAction({ id: pet.id, type, ...extra });
  };

  const handleMonitorUpdate = () => {
    updateSugar({ id: pet.id, value: monitorValue });
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden p-4">
      {/* Mobile-style Container */}
      <div className="relative w-full max-w-[450px] aspect-[9/19] bg-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5">
        
        {/* Top Status Bars - Left/Right Style */}
        <div className="absolute top-8 left-4 right-4 z-20 grid grid-cols-2 gap-4 h-32">
          {/* Left Side: Health & Energy */}
          <div className="flex flex-col gap-2">
            <StatusIndicator 
              label="HP" 
              value={pet.health} 
              icon={<Heart className="w-3 h-3 text-pink-500" />} 
              colorClass="bg-pink-500" 
              className="h-8"
            />
            <StatusIndicator 
              label="NRG" 
              value={pet.energy} 
              icon={<Zap className="w-3 h-3 text-yellow-500" />} 
              colorClass="bg-yellow-500" 
              className="h-8"
            />
          </div>
          
          {/* Right Side: Hunger & BS */}
          <div className="flex flex-col gap-2">
            <StatusIndicator 
              label="FOOD" 
              value={pet.hunger} 
              icon={<Utensils className="w-3 h-3 text-orange-500" />} 
              colorClass="bg-orange-500" 
              className="h-8"
            />
            <StatusIndicator 
              label="BS" 
              value={pet.bloodSugar} 
              max={300}
              icon={<Activity className="w-3 h-3 text-red-500" />} 
              type="bloodSugar"
              className="h-8"
            />
          </div>
        </div>

        {/* Center: Pet Avatar */}
        <div className="flex-1 flex items-center justify-center relative bg-gradient-to-b from-primary/5 to-transparent">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full px-8"
          >
            <PetAvatar pet={pet} className="w-full max-w-[280px] mx-auto drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]" />
          </motion.div>
          
          {/* Floating Actions */}
          <div className="absolute bottom-32 left-0 right-0 px-6 flex justify-between items-center">
            <Button 
              size="icon"
              variant="secondary"
              className="w-14 h-14 rounded-2xl shadow-lg hover-elevate"
              onClick={() => handleAction(pet.isAsleep ? 'wake' : 'sleep')}
              disabled={actionPending}
            >
              {pet.isAsleep ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="icon"
                  variant="secondary"
                  className="w-14 h-14 rounded-2xl shadow-lg hover-elevate"
                  disabled={pet.isAsleep || actionPending}
                >
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
                <Button 
                  size="icon"
                  variant="secondary"
                  className="w-14 h-14 rounded-2xl shadow-lg hover-elevate"
                  disabled={pet.isAsleep || actionPending}
                >
                  <Activity className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-white/10">
                <h2 className="text-xl font-display text-center mb-4">Insulin Pump</h2>
                <InsulinControl 
                  currentBloodSugar={pet.bloodSugar} 
                  isPending={actionPending}
                  onAdminister={(units) => handleAction('insulin', { insulinUnits: units })}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              size="icon"
              variant="secondary"
              className="w-14 h-14 rounded-2xl shadow-lg hover-elevate"
              onClick={() => setChatOpen(!chatOpen)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Bottom Bar: Quick Nav / Additional Info */}
        <div className="h-20 bg-muted/30 backdrop-blur-md flex items-center justify-around border-t border-white/5">
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary">
            <Gamepad2 className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary">
            <Stethoscope className="w-6 h-6" />
          </Button>
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold">
            LV1
          </div>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary">
             <Activity className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary">
             <Zap className="w-6 h-6" />
          </Button>
        </div>

        {/* Overlays: Chat */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute inset-0 z-50 bg-card flex flex-col pt-12"
            >
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
                <Input 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Say something..."
                  className="rounded-2xl h-14 bg-card border-none"
                />
                <Button type="submit" size="icon" className="w-14 h-14 rounded-2xl shrink-0" disabled={chatPending}>
                  <MessageCircle className="w-6 h-6" />
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
