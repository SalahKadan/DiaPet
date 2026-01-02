import { Pet } from "@shared/schema";
import { usePetAction, useUpdateBloodSugar, useChat } from "@/hooks/use-pets";
import { PetAvatar } from "@/components/PetAvatar";
import { StatusIndicator } from "@/components/StatusIndicator";
import { FoodSelector } from "@/components/FoodSelector";
import { InsulinControl } from "@/components/InsulinControl";
import { GamesMenu } from "@/components/GamesMenu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Heart, Zap, Utensils, Moon, Sun, MessageCircle, Activity, BarChart3, Gamepad2, Syringe, Coins, Clock, Settings, ShoppingCart, Monitor } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface PetDashboardProps {
  pet: Pet;
}

export function PetDashboard({ pet }: PetDashboardProps) {
  const { t, isRTL } = useLanguage();
  const { mutate: performAction, isPending: actionPending } = usePetAction();
  const { mutate: updateSugar, isPending: sugarPending } = useUpdateBloodSugar();
  const { mutate: sendChat, isPending: chatPending } = useChat();

  const [namingOpen, setNamingOpen] = useState(!pet.name || pet.name === "Diabeats");
  const [petName, setPetName] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [bloodTestOpen, setBloodTestOpen] = useState(false);
  const [foodMenuOpen, setFoodMenuOpen] = useState(false);
  const [insulinMenuOpen, setInsulinMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'pet', text: string}[]>([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showBloodTestAnimation, setShowBloodTestAnimation] = useState(false);
  const [bloodTestPhase, setBloodTestPhase] = useState<'idle' | 'finger' | 'testing' | 'result' | 'reward'>('idle');
  const [earnedCoin, setEarnedCoin] = useState<number | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showChallengeComplete, setShowChallengeComplete] = useState(false);
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const [monitorOn, setMonitorOn] = useState(false);
  const lastScenarioRef = useRef<string | null>(null);
  const challengeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pet.lastBloodTest) {
      const updateCooldown = () => {
        const lastTest = new Date(pet.lastBloodTest!);
        const now = new Date();
        const elapsed = (now.getTime() - lastTest.getTime()) / 1000;
        const remaining = Math.max(0, 60 - elapsed);
        setCooldownRemaining(Math.ceil(remaining));
      };
      updateCooldown();
      const interval = setInterval(updateCooldown, 1000);
      return () => clearInterval(interval);
    } else {
      setCooldownRemaining(0);
    }
  }, [pet.lastBloodTest]);

  useEffect(() => {
    if (pet.activeScenario) {
      lastScenarioRef.current = pet.activeScenario;
      setShowChallenge(true);
    } else {
      lastScenarioRef.current = null;
      setShowChallenge(false);
    }
  }, [pet.activeScenario]);

  useEffect(() => {
    challengeIntervalRef.current = setInterval(() => {
      if (!pet.isAsleep) {
        handleActionMutation.mutate({ id: pet.id, type: 'play' });
      }
    }, 120000);
    return () => {
      if (challengeIntervalRef.current) {
        clearInterval(challengeIntervalRef.current);
      }
    };
  }, [pet.id, pet.isAsleep]);

  const isBloodSugarGood = pet.bloodSugar >= 70 && pet.bloodSugar <= 180;
  const isNotHungry = pet.hunger >= 50;
  const isNotTired = pet.energy >= 40;
  const isPetGood = isBloodSugarGood && isNotHungry && isNotTired;

  const autoHealMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/auto-heal`);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.healed || data.challengeCompleted || data.leveledUp) {
        queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      }
      if (data.challengeCompleted) {
        setShowChallengeComplete(true);
        setTimeout(() => setShowChallengeComplete(false), 3000);
      }
      if (data.leveledUp) {
        setNewLevel(data.newLevel);
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 4000);
      }
    }
  });

  useEffect(() => {
    const checkInterval = pet.activeScenario ? 2000 : 30000;
    const healInterval = setInterval(() => {
      autoHealMutation.mutate();
    }, checkInterval);
    return () => clearInterval(healInterval);
  }, [pet.id, isPetGood, pet.health, pet.activeScenario]);

  const tickMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/tick`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    }
  });

  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (!pet.isAsleep) {
        tickMutation.mutate();
      }
    }, 15000);
    return () => clearInterval(tickInterval);
  }, [pet.id, pet.isAsleep]);

  const getCareInstructions = () => {
    const instructions: string[] = [];
    const isBloodSugarLow = pet.bloodSugar < 70;
    const isBloodSugarHigh = pet.bloodSugar > 180;
    const isHungry = pet.hunger < 40;
    const isTired = pet.energy < 30;
    const isUnhealthy = pet.health < 50;

    if (isBloodSugarLow) {
      instructions.push("My blood sugar is too low! Give me a snack to bring it up.");
    }
    if (isBloodSugarHigh) {
      instructions.push("My blood sugar is too high! I need some insulin to bring it down.");
    }
    if (isHungry && !isBloodSugarHigh) {
      instructions.push("I'm getting hungry! Feed me something yummy.");
    }
    if (isTired) {
      instructions.push("I'm feeling tired. Let me take a nap to restore my energy.");
    }
    if (isUnhealthy) {
      if (isBloodSugarLow) {
        instructions.push("My health is dropping because my blood sugar is low. Food will help restore my HP!");
      } else if (isBloodSugarHigh) {
        instructions.push("My health is dropping because my blood sugar is high. Insulin will help restore my HP!");
      } else {
        instructions.push("My health is low. Keep my blood sugar in the green zone (70-180) and I'll feel better!");
      }
    }
    
    return instructions;
  };

  const careInstructions = getCareInstructions();

  const nameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("PATCH", `/api/pets/${pet.id}`, { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      setNamingOpen(false);
    }
  });

  const [bloodTestMessage, setBloodTestMessage] = useState<string | null>(null);

  const bloodTestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/blood-test`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      if (data.success) {
        setBloodTestPhase('reward');
        setEarnedCoin(data.coinsEarned);
        if (data.isBloodSugarBad) {
          setBloodTestMessage("Blood sugar is out of range! You lost a coin.");
        } else {
          setBloodTestMessage("Great job! You earned a coin!");
        }
        setTimeout(() => {
          setEarnedCoin(null);
          setShowBloodTestAnimation(false);
          setBloodTestPhase('idle');
          setBloodTestMessage(null);
        }, 2000);
      } else if (data.cooldown) {
        setBloodTestMessage(`Please wait ${data.remainingSeconds || 0} seconds before testing again.`);
        setTimeout(() => {
          setShowBloodTestAnimation(false);
          setBloodTestPhase('idle');
          setBloodTestMessage(null);
        }, 2000);
      }
      setBloodTestOpen(false);
    }
  });

  const startBloodTest = () => {
    if (cooldownRemaining > 0 || bloodTestMutation.isPending) return;
    setShowBloodTestAnimation(true);
    setBloodTestPhase('finger');
    setBloodTestMessage(null);
    
    setTimeout(() => setBloodTestPhase('testing'), 1000);
    setTimeout(() => {
      setBloodTestPhase('result');
      bloodTestMutation.mutate();
    }, 2500);
  };

  const handleActionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/pets/${data.id}/action`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      if (variables.type === 'feed') setFoodMenuOpen(false);
      if (variables.type === 'insulin') setInsulinMenuOpen(false);
    }
  });

  const handleAction = (type: 'feed' | 'insulin' | 'sleep' | 'wake' | 'play', extra?: any) => {
    handleActionMutation.mutate({ id: pet.id, type, ...extra });
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
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative w-full max-w-[450px] aspect-[9/19] bg-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5">
        
        <AnimatePresence>
          {namingOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                  <h2 className="text-4xl font-display font-bold mb-2">{t.dashboard.welcome}</h2>
                  <p className="text-muted-foreground">{t.dashboard.nameYourFriend}</p>
                </div>
                <div className="space-y-4">
                  <Input 
                    value={petName} 
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter a name..." 
                    className="h-16 text-2xl text-center rounded-2xl bg-card border-2 border-primary/20 focus:border-primary"
                  />
                  <Button 
                    className="w-full h-16 text-xl rounded-2xl font-bold"
                    onClick={() => nameMutation.mutate(petName)}
                    disabled={!petName.trim() || nameMutation.isPending}
                  >
                    {nameMutation.isPending ? t.dashboard.naming : t.dashboard.letsPlay}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

                  </AnimatePresence>

        
        <AnimatePresence>
          {showBloodTestAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[90] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: bloodTestPhase === 'testing' ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: bloodTestPhase === 'testing' ? Infinity : 0, duration: 0.5 }}
                  className="relative"
                >
                  <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
                    <rect x="60" y="80" width="80" height="100" rx="8" fill="#3B82F6" />
                    <rect x="70" y="90" width="60" height="40" rx="4" fill="#1E3A8A" />
                    <AnimatePresence mode="wait">
                      {bloodTestPhase === 'result' || bloodTestPhase === 'reward' ? (
                        <motion.text
                          key="result"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          x="100"
                          y="118"
                          textAnchor="middle"
                          fill="#22C55E"
                          fontSize="18"
                          fontWeight="bold"
                        >
                          {pet.bloodSugar}
                        </motion.text>
                      ) : bloodTestPhase === 'testing' ? (
                        <motion.text
                          key="testing"
                          x="100"
                          y="118"
                          textAnchor="middle"
                          fill="#60A5FA"
                          fontSize="14"
                        >
                          ...
                        </motion.text>
                      ) : null}
                    </AnimatePresence>
                    <circle cx="100" cy="160" r="12" fill="#93C5FD" />
                    <AnimatePresence>
                      {(bloodTestPhase === 'finger' || bloodTestPhase === 'testing') && (
                        <motion.g
                          initial={{ y: -30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                        >
                          <ellipse cx="100" cy="50" rx="15" ry="25" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="2" />
                          <circle cx="100" cy="68" r="3" fill="#EF4444" />
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </svg>
                </motion.div>

                <motion.p
                  key={bloodTestPhase + (bloodTestMessage || '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-medium text-foreground"
                >
                  {bloodTestPhase === 'finger' && t.dashboard.placingFinger}
                  {bloodTestPhase === 'testing' && t.dashboard.testingBloodSugar}
                  {bloodTestPhase === 'result' && (bloodTestMutation.isPending ? `${t.dashboard.bloodSugar} ${pet.bloodSugar} mg/dL` : (bloodTestMessage || `${t.dashboard.bloodSugar} ${pet.bloodSugar} mg/dL`))}
                  {bloodTestPhase === 'reward' && bloodTestMessage}
                </motion.p>

                {bloodTestPhase === 'reward' && earnedCoin !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Coins className={`w-8 h-8 ${earnedCoin > 0 ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className={`text-2xl font-bold ${earnedCoin > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {earnedCoin > 0 ? '+1' : '-1'}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showChallengeComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 z-[95] bg-green-500/20 backdrop-blur-sm flex flex-col items-center justify-center p-8"
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center max-w-sm"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: 2, duration: 0.3 }}
                  className="text-6xl mb-4"
                >
                  <Heart className="w-16 h-16 mx-auto text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">{t.dashboard.challengeComplete}</h2>
                <p className="text-muted-foreground mb-4">{t.dashboard.greatJob}</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-purple-600">+40 XP</span>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 px-4 py-2 rounded-full">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-yellow-600">+5</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[98] bg-gradient-to-b from-purple-500/30 to-blue-500/30 backdrop-blur-md flex flex-col items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: -50 }}
                transition={{ type: "spring", damping: 15 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl text-center max-w-sm border-4 border-yellow-400"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 0.8 }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-5xl font-bold text-white">{newLevel}</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
                >
                  {t.dashboard.levelUp}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground"
                >
                  {t.dashboard.youReached} {newLevel}!
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-12 px-6 flex flex-col gap-4 z-20">
          <div className="grid grid-cols-2 gap-4">
            <StatusIndicator label={t.dashboard.hp} value={pet.health} icon={<Heart className="w-3 h-3 text-pink-500" />} colorClass="bg-pink-500" className="h-8" />
            <StatusIndicator label={t.dashboard.bs} value={pet.bloodSugar} max={300} icon={<Activity className="w-3 h-3 text-red-500" />} type="bloodSugar" className="h-8" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatusIndicator label={t.dashboard.food} value={pet.hunger} icon={<Utensils className="w-3 h-3 text-orange-500" />} colorClass="bg-orange-500" className="h-8" />
            <StatusIndicator label={t.dashboard.nrg} value={pet.energy} icon={<Zap className="w-3 h-3 text-yellow-500" />} colorClass="bg-yellow-500" className="h-8" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 px-3 py-1.5 rounded-full shadow-md">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300" data-testid="text-coins">{pet.coins || 0}</span>
                <AnimatePresence>
                  {earnedCoin !== null && (
                    <motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-xs font-bold ${earnedCoin > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {earnedCoin > 0 ? '+1' : '-1'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {cooldownRemaining > 0 && (
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full shadow-md">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400" data-testid="text-cooldown">
                    {cooldownRemaining}s
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 text-muted-foreground"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`w-10 h-10 ${monitorOn ? 'text-green-500' : 'text-red-500'}`}
                onClick={() => setMonitorOn(!monitorOn)}
                data-testid="button-monitor"
              >
                <Monitor className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative bg-gradient-to-b from-primary/5 to-transparent pt-8">
          <div className="relative w-full px-8">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <AnimatePresence>
                {showChallenge && pet.activeScenario && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="absolute -top-24 left-0 z-30 w-[95%] max-w-[280px]"
                  >
                    <div className="bg-white dark:bg-white text-gray-800 rounded-[24px] p-4 shadow-lg relative border border-gray-100">
                      <div className="absolute -bottom-3 left-1/4 flex flex-col items-center">
                        <div className="w-4 h-4 bg-white dark:bg-white rounded-full shadow-sm border border-gray-100" />
                        <div className="w-2.5 h-2.5 bg-white dark:bg-white rounded-full shadow-sm border border-gray-100 -mt-1" />
                        <div className="w-1.5 h-1.5 bg-white dark:bg-white rounded-full shadow-sm border border-gray-100 -mt-0.5" />
                      </div>
                      <p className="text-[10px] uppercase tracking-widest mb-1 text-blue-500 font-semibold">{t.dashboard.newChallenge}</p>
                      <p className="text-sm font-medium leading-relaxed">{pet.scenarioDescription || t.dashboard.somethingHappening}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <PetAvatar pet={pet} className="w-full max-w-[280px] mx-auto drop-shadow-[0_0_50px_rgba(59,130,246,0.3)]" />
            </motion.div>
          </div>
          
          <div className="mt-6 text-center px-6">
            <h2 className="text-2xl font-display font-bold text-primary mb-2">{pet.name}</h2>
            <AnimatePresence mode="wait">
              {!isPetGood ? (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-amber-50 dark:bg-amber-900/30 backdrop-blur-sm rounded-2xl p-3 border border-amber-200 dark:border-amber-700/50 shadow-inner"
                >
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold mb-2">How to help me:</p>
                  <div className="space-y-1.5">
                    {careInstructions.map((instruction, index) => (
                      <p key={index} className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        {instruction}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="happy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl p-3 border border-green-200 dark:border-green-700/50 shadow-inner"
                >
                  <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                    I'm feeling great! Keep up the good work!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 px-6 flex justify-around items-center w-full max-w-[320px] gap-4">
            <Button size="icon" variant="default" className="w-14 h-14 rounded-2xl shadow-lg bg-blue-500 hover:bg-blue-600 hover-elevate" onClick={() => handleAction(pet.isAsleep ? 'wake' : 'sleep')} disabled={handleActionMutation.isPending}>
              {pet.isAsleep ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </Button>
            <Dialog open={foodMenuOpen} onOpenChange={setFoodMenuOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="default" className="w-14 h-14 rounded-2xl shadow-lg bg-blue-500 hover:bg-blue-600 hover-elevate" disabled={pet.isAsleep || handleActionMutation.isPending}>
                  <Utensils className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-white/10">
                <h2 className="text-xl font-display text-center mb-4">Pick a Snack!</h2>
                <FoodSelector onSelect={(foodId) => handleAction('feed', { foodId })} disabled={handleActionMutation.isPending} />
              </DialogContent>
            </Dialog>
            <Dialog open={insulinMenuOpen} onOpenChange={setInsulinMenuOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="default" className="w-14 h-14 rounded-2xl shadow-lg bg-blue-500 hover:bg-blue-600 hover-elevate" disabled={pet.isAsleep || handleActionMutation.isPending}>
                  <Activity className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[350px] rounded-3xl bg-card/95 backdrop-blur-xl border-white/10">
                <h2 className="text-xl font-display text-center mb-4">Insulin Pump</h2>
                <InsulinControl currentBloodSugar={pet.bloodSugar} isPending={handleActionMutation.isPending} onAdminister={(units) => handleAction('insulin', { insulinUnits: units })} />
              </DialogContent>
            </Dialog>
            <Button size="icon" variant="default" className="w-14 h-14 rounded-2xl shadow-lg bg-blue-500 hover:bg-blue-600 hover-elevate" onClick={() => setChatOpen(!chatOpen)}>
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="h-20 bg-muted/30 backdrop-blur-md flex items-center justify-around border-t border-white/5">
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate" onClick={() => setGamesMenuOpen(true)} data-testid="button-games">
            <Gamepad2 className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`w-12 h-12 hover-elevate ${cooldownRemaining > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-muted-foreground hover:text-primary'}`} 
            onClick={startBloodTest}
            disabled={cooldownRemaining > 0 || showBloodTestAnimation}
            data-testid="button-blood-test"
          >
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
                  {t.dashboard.lvlUpSoon}
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
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate" onClick={() => window.location.href = "/analysis"} data-testid="button-analysis">
             <BarChart3 className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="w-12 h-12 text-muted-foreground hover:text-primary hover-elevate" onClick={() => window.location.href = "/settings"} data-testid="button-settings">
             <Settings className="w-6 h-6" />
          </Button>
        </div>

        <AnimatePresence>
          {gamesMenuOpen && (
            <GamesMenu isOpen={gamesMenuOpen} onClose={() => setGamesMenuOpen(false)} petId={pet.id} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute inset-0 z-50 bg-card flex flex-col pt-12">
              <div className="px-6 flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">{t.dashboard.ask} {pet.name}</h3>
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
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t.dashboard.saySmth} className="rounded-2xl h-14 bg-card border-none" />
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
              <h2 className="text-3xl font-display font-bold mb-4">{t.dashboard.timeForCheck}</h2>
              <p className="text-muted-foreground mb-8 max-w-xs">
                {t.dashboard.checkingHelps}
              </p>
              <div className="bg-card p-6 rounded-3xl w-full mb-8 shadow-xl">
                 <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">{t.dashboard.reading}</p>
                 <p className="text-5xl font-bold text-primary">{pet.bloodSugar} mg/dL</p>
                 {pet.activeScenario && (
                   <div className="mt-4 p-3 bg-primary/10 rounded-xl text-xs text-left border border-primary/20">
                     <p className="font-bold text-primary mb-1">{t.dashboard.educationTip}</p>
                     <p className="text-muted-foreground leading-relaxed">
                       {pet.activeScenario === 'sport' && t.dashboard.exerciseHelps}
                       {pet.activeScenario === 'party' && t.dashboard.sugarySnacks}
                       {pet.activeScenario === 'nap' && t.dashboard.evenResting}
                     </p>
                   </div>
                 )}
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button size="lg" className="h-16 rounded-2xl text-xl font-bold" onClick={() => bloodTestMutation.mutate()} disabled={bloodTestMutation.isPending}>
                  {bloodTestMutation.isPending ? t.dashboard.testing : t.dashboard.finishTest}
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
