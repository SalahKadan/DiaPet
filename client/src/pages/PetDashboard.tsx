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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Pet Avatar & Quick Actions */}
      <div className="space-y-6">
        <Card className="p-8 glass-card border-none rounded-[2rem] text-center relative overflow-hidden">
          <PetAvatar pet={pet} />
          
          <div className="mt-8 grid grid-cols-2 gap-3">
            <Button 
              size="lg"
              className="rounded-2xl h-14 text-lg bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 shadow-sm"
              onClick={() => handleAction(pet.isAsleep ? 'wake' : 'sleep')}
              disabled={actionPending}
            >
              {pet.isAsleep ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
              {pet.isAsleep ? "Wake Up" : "Sleep"}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="rounded-2xl h-14 text-lg bg-green-100 hover:bg-green-200 text-green-700 border border-green-200 shadow-sm"
                  disabled={pet.isAsleep || actionPending}
                >
                  <Utensils className="mr-2" /> Feed
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-3xl">
                <h2 className="text-2xl font-display text-center mb-4">Pick a Healthy Snack!</h2>
                <FoodSelector onSelect={(foodId) => handleAction('feed', { foodId })} disabled={actionPending} />
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* AI Chat Bubble */}
        <Card className="glass-card border-none rounded-[2rem] p-6 relative">
          <div className="absolute -top-3 -right-3 rotate-12 bg-yellow-400 text-white px-3 py-1 rounded-full font-bold shadow-md text-xs">
            BETA
          </div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <MessageCircle className="w-6 h-6 text-primary" />
            Ask {pet.name}
          </h3>
          
          <div className="h-48 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
             {chatHistory.length === 0 && (
               <p className="text-gray-400 text-center italic text-sm mt-10">
                 "Ask me about healthy food or how I'm feeling!"
               </p>
             )}
             {chatHistory.map((msg, i) => (
               <div key={i} className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary/10 ml-8 text-right' : 'bg-gray-100 mr-8'}`}>
                 {msg.text}
               </div>
             ))}
             {chatPending && <div className="text-xs text-gray-400 animate-pulse">Thinking...</div>}
          </div>

          <form onSubmit={handleChat} className="flex gap-2">
            <Input 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              placeholder="Type a message..."
              className="rounded-xl border-slate-200 focus-visible:ring-primary"
            />
            <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={chatPending}>
              <MessageCircle className="w-5 h-5" />
            </Button>
          </form>
        </Card>
      </div>

      {/* CENTER COLUMN: Status & Vitals */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Main Status Bars */}
        <Card className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-wider text-xs">Vitals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <StatusIndicator 
              label="Health" 
              value={pet.health} 
              icon={<Heart className="w-4 h-4 text-pink-500" />} 
              colorClass="bg-pink-500" 
            />
            <StatusIndicator 
              label="Energy" 
              value={pet.energy} 
              icon={<Zap className="w-4 h-4 text-yellow-500" />} 
              colorClass="bg-yellow-500" 
            />
            <StatusIndicator 
              label="Hunger" 
              value={pet.hunger} 
              icon={<Utensils className="w-4 h-4 text-orange-500" />} 
              colorClass="bg-orange-500" 
            />
            <StatusIndicator 
              label="Blood Sugar" 
              value={pet.bloodSugar} 
              max={300}
              icon={<Activity className="w-4 h-4 text-red-500" />} 
              type="bloodSugar"
            />
          </div>
        </Card>

        {/* Diabetes Management Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Insulin Management */}
          <Card className="p-6 rounded-[2rem] border border-blue-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100%] -z-10" />
            <h3 className="font-display text-2xl text-blue-900 mb-4">Insulin Pump</h3>
            <InsulinControl 
              currentBloodSugar={pet.bloodSugar} 
              isPending={actionPending}
              onAdminister={(units) => handleAction('insulin', { insulinUnits: units })}
            />
          </Card>

          {/* Sensor Simulation (Monitoring Mode) */}
          <Card className="p-6 rounded-[2rem] border border-slate-100 shadow-sm bg-slate-50">
            <h3 className="font-display text-2xl text-slate-700 mb-2 flex items-center gap-2">
              <Stethoscope className="w-6 h-6" />
              Sensor Monitor
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Simulate a continuous glucose monitor (CGM) reading.
            </p>

            <div className="space-y-8 px-2">
              <div className="text-center">
                <span className={`text-4xl font-bold ${monitorValue > 180 || monitorValue < 70 ? 'text-red-500' : 'text-green-600'}`}>
                  {monitorValue}
                </span>
                <span className="text-sm text-gray-400 ml-1">mg/dL</span>
              </div>
              
              <Slider 
                value={[monitorValue]} 
                onValueChange={(val) => setMonitorValue(val[0])}
                min={40}
                max={400}
                step={1}
                className="py-2"
              />

              <Button 
                onClick={handleMonitorUpdate}
                disabled={sugarPending}
                className="w-full rounded-xl"
                variant="outline"
              >
                Update Sensor Reading
              </Button>
            </div>
          </Card>
        </div>

        {/* Mini Games Access */}
        <Card className="p-6 rounded-[2rem] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="font-display text-3xl mb-1">Mini Games</h3>
              <p className="opacity-90">Play to learn about healthy habits!</p>
            </div>
            <Gamepad2 className="w-12 h-12 opacity-80" />
          </div>
          {/* Coming soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            <span className="font-bold text-xl tracking-widest">COMING SOON</span>
          </div>
        </Card>

      </div>
    </div>
  );
}
