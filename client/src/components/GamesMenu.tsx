import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Brain, Puzzle, Target, Clock, Lock, Heart, Trophy, Star, Sparkles, CheckCircle, XCircle, Shield, Home, School, Palmtree, PartyPopper, Moon, Activity, Users, Coffee, Cookie, Coins, TreePine, Droplets, Syringe, Apple, Bed, Zap, Cat } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GamesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  petId: number;
}

function getScenarios(t: ReturnType<typeof useLanguage>['t']) {
  return [
    {
      id: 1,
      question: t.games.scenario1Q,
      options: [
        { text: t.games.scenario1A1, correct: true },
        { text: t.games.scenario1A2, correct: false }
      ],
      explanation: t.games.scenario1Exp
    },
    {
      id: 2,
      question: t.games.scenario2Q,
      options: [
        { text: t.games.scenario2A1, correct: false },
        { text: t.games.scenario2A2, correct: true }
      ],
      explanation: t.games.scenario2Exp
    },
    {
      id: 3,
      question: t.games.scenario3Q,
      options: [
        { text: t.games.scenario3A1, correct: true },
        { text: t.games.scenario3A2, correct: false }
      ],
      explanation: t.games.scenario3Exp
    },
    {
      id: 4,
      question: t.games.scenario4Q,
      options: [
        { text: t.games.scenario4A1, correct: false },
        { text: t.games.scenario4A2, correct: true }
      ],
      explanation: t.games.scenario4Exp
    },
    {
      id: 5,
      question: t.games.scenario5Q,
      options: [
        { text: t.games.scenario5A1, correct: true },
        { text: t.games.scenario5A2, correct: false }
      ],
      explanation: t.games.scenario5Exp
    },
    {
      id: 6,
      question: t.games.scenario6Q,
      options: [
        { text: t.games.scenario6A1, correct: true },
        { text: t.games.scenario6A2, correct: false }
      ],
      explanation: t.games.scenario6Exp
    },
    {
      id: 7,
      question: t.games.scenario7Q,
      options: [
        { text: t.games.scenario7A1, correct: true },
        { text: t.games.scenario7A2, correct: false }
      ],
      explanation: t.games.scenario7Exp
    },
    {
      id: 8,
      question: t.games.scenario8Q,
      options: [
        { text: t.games.scenario8A1, correct: false },
        { text: t.games.scenario8A2, correct: true }
      ],
      explanation: t.games.scenario8Exp
    },
    {
      id: 9,
      question: t.games.scenario9Q,
      options: [
        { text: t.games.scenario9A1, correct: false },
        { text: t.games.scenario9A2, correct: true }
      ],
      explanation: t.games.scenario9Exp
    },
    {
      id: 10,
      question: t.games.scenario10Q,
      options: [
        { text: t.games.scenario10A1, correct: true },
        { text: t.games.scenario10A2, correct: false }
      ],
      explanation: t.games.scenario10Exp
    }
  ];
}

type SafetyAction = 'checkSugar' | 'followPlan' | 'getHelp' | 'takeRest' | 'haveSnack';

interface SafetyScenario {
  id: number;
  question: string;
  location: string;
  correctAction: SafetyAction;
  explanation: string;
}

function getSafetyScenarios(t: ReturnType<typeof useLanguage>['t']): SafetyScenario[] {
  return [
    { id: 1, question: t.games.safety1Q, location: 'home', correctAction: 'checkSugar', explanation: t.games.safety1Exp },
    { id: 2, question: t.games.safety2Q, location: 'school', correctAction: 'getHelp', explanation: t.games.safety2Exp },
    { id: 3, question: t.games.safety3Q, location: 'play', correctAction: 'takeRest', explanation: t.games.safety3Exp },
    { id: 4, question: t.games.safety4Q, location: 'party', correctAction: 'checkSugar', explanation: t.games.safety4Exp },
    { id: 5, question: t.games.safety5Q, location: 'night', correctAction: 'haveSnack', explanation: t.games.safety5Exp },
    { id: 6, question: t.games.safety6Q, location: 'school', correctAction: 'getHelp', explanation: t.games.safety6Exp },
    { id: 7, question: t.games.safety7Q, location: 'play', correctAction: 'followPlan', explanation: t.games.safety7Exp },
    { id: 8, question: t.games.safety8Q, location: 'night', correctAction: 'getHelp', explanation: t.games.safety8Exp },
    { id: 9, question: t.games.safety9Q, location: 'play', correctAction: 'haveSnack', explanation: t.games.safety9Exp },
    { id: 10, question: t.games.safety10Q, location: 'play', correctAction: 'checkSugar', explanation: t.games.safety10Exp },
  ];
}

function SafetyRoutineGame({ onBack, petId }: { onBack: () => void; petId: number }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const scenarios = getSafetyScenarios(t);
  const [hearts, setHearts] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong' | 'gameover' | 'victory'>('playing');
  const [shuffledScenarios] = useState(() => [...scenarios].sort(() => Math.random() - 0.5).slice(0, 8));
  const coinsAddedRef = useRef(false);

  const addCoinsMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest('POST', `/api/pets/${petId}/add-coins`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
    }
  });

  const currentScenario = shuffledScenarios[currentIndex];

  const LocationIcon = ({ location }: { location: string }) => {
    const iconClass = "w-5 h-5";
    switch (location) {
      case 'home': return <Home className={iconClass} />;
      case 'school': return <School className={iconClass} />;
      case 'play': return <Palmtree className={iconClass} />;
      case 'party': return <PartyPopper className={iconClass} />;
      case 'night': return <Moon className={iconClass} />;
      default: return <Home className={iconClass} />;
    }
  };

  const getLocationName = (location: string) => {
    switch (location) {
      case 'home': return t.games.atHome;
      case 'school': return t.games.atSchool;
      case 'play': return t.games.atPlay;
      case 'party': return t.games.atParty;
      case 'night': return t.games.atNight;
      default: return location;
    }
  };

  const safetyActions: { id: SafetyAction; label: string; icon: typeof Activity }[] = [
    { id: 'checkSugar', label: t.games.checkSugar, icon: Activity },
    { id: 'followPlan', label: t.games.followPlan, icon: Shield },
    { id: 'getHelp', label: t.games.getHelp, icon: Users },
    { id: 'takeRest', label: t.games.takeRest, icon: Coffee },
    { id: 'haveSnack', label: t.games.haveSnack, icon: Cookie },
  ];

  const handleAction = (actionId: SafetyAction) => {
    if (gameState !== 'playing') return;
    
    const isCorrect = actionId === currentScenario.correctAction;
    
    if (isCorrect) {
      setScore(score + 1);
      setGameState('correct');
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setGameState('wrong');
      if (newHearts <= 0) {
        setTimeout(() => setGameState('gameover'), 1500);
        return;
      }
    }

    setTimeout(() => {
      if (currentIndex + 1 >= shuffledScenarios.length) {
        setGameState('victory');
      } else {
        setCurrentIndex(currentIndex + 1);
        setGameState('playing');
      }
    }, 2000);
  };

  useEffect(() => {
    if (gameState === 'victory' && !coinsAddedRef.current) {
      coinsAddedRef.current = true;
      addCoinsMutation.mutate(5);
    }
  }, [gameState, addCoinsMutation]);

  const resetGame = () => {
    setHearts(3);
    setCurrentIndex(0);
    setScore(0);
    setGameState('playing');
    coinsAddedRef.current = false;
  };

  if (gameState === 'gameover') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: 2, duration: 0.5 }}>
          <XCircle className="w-24 h-24 text-red-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-red-500 mb-2">{t.games.gameOver}</h2>
        <p className="text-muted-foreground mb-2">{t.games.ranOutHearts}</p>
        <p className="text-lg font-semibold mb-4">{t.games.score}: {score}/{shuffledScenarios.length}</p>
        <div className="flex gap-3">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.tryAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'victory') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} transition={{ duration: 0.8 }}>
          <Trophy className="w-24 h-24 text-yellow-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">{t.games.youWin}</h2>
        <p className="text-muted-foreground mb-2">{t.games.amazingJob}</p>
        <p className="text-lg font-semibold mb-2">{t.games.score}: {score}/{shuffledScenarios.length}</p>
        <div className="flex items-center gap-2 mb-4 text-yellow-500">
          <Coins className="w-6 h-6" />
          <span className="font-bold text-xl">+5</span>
        </div>
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: hearts }).map((_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="flex gap-3">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.playAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={i >= hearts ? { scale: [1, 0], opacity: [1, 0] } : { scale: 1, opacity: 1 }}
            >
              <Heart className={`w-6 h-6 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-sm text-yellow-600">5</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="text-xs text-muted-foreground mb-2">
          {t.games.question} {currentIndex + 1} {t.games.of} {shuffledScenarios.length}
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'correct' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-sm z-10"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              <p className="text-xl font-bold text-green-600">{t.games.goodJob}</p>
              <p className="text-sm text-muted-foreground mt-2 px-6 text-center max-w-xs">
                {currentScenario.explanation}
              </p>
            </motion.div>
          )}
          {gameState === 'wrong' && hearts > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 backdrop-blur-sm z-10"
            >
              <XCircle className="w-20 h-20 text-red-500 mb-4" />
              <p className="text-xl font-bold text-red-600">{t.games.oops}</p>
              <p className="text-sm text-muted-foreground mt-2 px-6 text-center max-w-xs">
                {currentScenario.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-primary/20 px-3 py-1 rounded-full">
              <LocationIcon location={currentScenario.location} />
              <span className="text-sm font-medium">{getLocationName(currentScenario.location)}</span>
            </div>
          </div>

          <Card className="p-5 mb-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t.games.feelingOff}</p>
                <p className="text-base font-medium leading-relaxed">{currentScenario.question}</p>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mb-3">{t.games.whatToDo}</p>

          <div className="grid grid-cols-2 gap-2">
            {safetyActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-sm font-medium"
                    onClick={() => handleAction(action.id)}
                    disabled={gameState !== 'playing'}
                    data-testid={`button-safety-${action.id}`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

type TreeAction = 'eatFood' | 'takeInsulin' | 'rest' | 'drinkWater' | 'checkLevels';

interface TreeLevel {
  bloodSugar: 'low' | 'high' | 'normal';
  energy: 'low' | 'normal';
  correctAction: TreeAction;
  distractors: TreeAction[];
}

function generateTreeLevels(): TreeLevel[] {
  const levels: TreeLevel[] = [
    { bloodSugar: 'low', energy: 'normal', correctAction: 'eatFood', distractors: ['takeInsulin', 'rest'] },
    { bloodSugar: 'high', energy: 'normal', correctAction: 'takeInsulin', distractors: ['eatFood', 'rest'] },
    { bloodSugar: 'normal', energy: 'low', correctAction: 'rest', distractors: ['takeInsulin', 'eatFood'] },
    { bloodSugar: 'low', energy: 'low', correctAction: 'eatFood', distractors: ['takeInsulin', 'drinkWater'] },
    { bloodSugar: 'high', energy: 'low', correctAction: 'takeInsulin', distractors: ['eatFood', 'rest'] },
    { bloodSugar: 'normal', energy: 'normal', correctAction: 'checkLevels', distractors: ['takeInsulin', 'eatFood'] },
    { bloodSugar: 'low', energy: 'normal', correctAction: 'eatFood', distractors: ['drinkWater', 'checkLevels'] },
    { bloodSugar: 'high', energy: 'normal', correctAction: 'takeInsulin', distractors: ['drinkWater', 'checkLevels'] },
  ];
  return levels;
}

interface LogOption {
  action: TreeAction;
  isCorrect: boolean;
}

function TreeClimbGame({ onBack, petId }: { onBack: () => void; petId: number }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'jumping' | 'falling' | 'victory' | 'gameover'>('playing');
  const [levels, setLevels] = useState(() => generateTreeLevels());
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [worldScrollY, setWorldScrollY] = useState(0);
  const coinsAddedRef = useRef(false);
  const petControls = useAnimationControls();
  const maxLevel = levels.length;
  
  const LOG_SPACING = 160;
  const VIEWPORT_HEIGHT = 420;
  const PET_BASELINE = 70;

  const addCoinsMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest('POST', `/api/pets/${petId}/add-coins`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pets'] });
    }
  });

  useEffect(() => {
    if (gameState === 'victory' && !coinsAddedRef.current) {
      coinsAddedRef.current = true;
      addCoinsMutation.mutate(10);
    }
  }, [gameState, addCoinsMutation]);

  const currentLevelData = levels[currentLevel];

  const actionIcons: Record<TreeAction, typeof Apple> = {
    eatFood: Apple,
    takeInsulin: Syringe,
    rest: Bed,
    drinkWater: Droplets,
    checkLevels: Activity,
  };

  const actionLabels: Record<TreeAction, string> = {
    eatFood: t.games.eatFood,
    takeInsulin: t.games.takeInsulin,
    rest: t.games.rest,
    drinkWater: t.games.drinkWater,
    checkLevels: t.games.checkLevels,
  };

  const [logOptions, setLogOptions] = useState<LogOption[]>([]);

  useEffect(() => {
    const levelData = levels[currentLevel];
    if (levelData && gameState === 'playing') {
      const options: LogOption[] = [
        { action: levelData.correctAction, isCorrect: true },
        ...levelData.distractors.map(d => ({ action: d, isCorrect: false }))
      ];
      setLogOptions(options.sort(() => Math.random() - 0.5));
      setSelectedLogIndex(null);
    }
  }, [currentLevel, levels, gameState]);

  const runJumpSequence = async () => {
    await petControls.start({
      y: [0, -LOG_SPACING - 18, -LOG_SPACING - 18],
      scale: [1, 1.25, 1.15],
      rotate: [0, -12, 8],
      transition: { duration: 0.55, times: [0, 0.45, 1], ease: [0.16, 1, 0.3, 1] }
    });
    
    setWorldScrollY(prev => prev + LOG_SPACING);
    
    await new Promise(resolve => setTimeout(resolve, 350));
    
    await petControls.start({
      y: [-LOG_SPACING - 18, -LOG_SPACING - 6, 0],
      scale: [1.15, 1.05, 1],
      rotate: [8, -3, 0],
      transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
    });
  };

  const handleLogClick = async (logIndex: number, isCorrect: boolean) => {
    if (gameState !== 'playing') return;
    
    setSelectedLogIndex(logIndex);

    if (isCorrect) {
      setGameState('jumping');
      
      await runJumpSequence();
      
      if (currentLevel + 1 >= maxLevel) {
        setGameState('victory');
      } else {
        setCurrentLevel(prev => prev + 1);
        setSelectedLogIndex(null);
        setGameState('playing');
      }
    } else {
      setGameState('falling');
      setTimeout(() => {
        setGameState('gameover');
      }, 1500);
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setWorldScrollY(0);
    setSelectedLogIndex(null);
    setGameState('playing');
    setLevels(generateTreeLevels());
    coinsAddedRef.current = false;
  };

  const getBloodSugarValue = () => {
    if (!currentLevelData) return 50;
    switch (currentLevelData.bloodSugar) {
      case 'low': return 25;
      case 'high': return 85;
      default: return 50;
    }
  };

  const getEnergyValue = () => {
    if (!currentLevelData) return 70;
    return currentLevelData.energy === 'low' ? 20 : 70;
  };

  const getStatusLabel = () => {
    if (!currentLevelData) return t.games.normalLevels;
    if (currentLevelData.bloodSugar === 'low') return t.games.lowSugar;
    if (currentLevelData.bloodSugar === 'high') return t.games.highSugar;
    if (currentLevelData.energy === 'low') return t.games.lowEnergy;
    return t.games.normalLevels;
  };

  if (gameState === 'gameover') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full p-6 text-center"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <XCircle className="w-24 h-24 text-red-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-red-500 mb-2">{t.games.youFell}</h2>
        <p className="text-muted-foreground mb-2">{t.games.level}: {currentLevel + 1}/{maxLevel}</p>
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.tryAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'victory') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full p-6 text-center"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          <Trophy className="w-24 h-24 text-yellow-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">{t.games.reachedTop}</h2>
        <p className="text-muted-foreground mb-2">{t.games.amazingJob}</p>
        <div className="flex items-center gap-2 mb-4 text-yellow-500">
          <Coins className="w-6 h-6" />
          <span className="font-bold text-xl">+10</span>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.playAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  const worldHeight = (maxLevel + 2) * LOG_SPACING + 300;
  const logScreenY = LOG_SPACING + PET_BASELINE;

  return (
    <div className="flex flex-col h-full overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-2 p-3 border-b border-white/10 bg-gradient-to-b from-sky-600/30 to-sky-500/20 z-20">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-tree-back">
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <Progress value={getBloodSugarValue()} className="flex-1 h-2" />
            <span className={`text-[10px] font-bold w-8 text-center ${
              currentLevelData?.bloodSugar === 'low' ? 'text-orange-400' : 
              currentLevelData?.bloodSugar === 'high' ? 'text-red-400' : 'text-green-400'
            }`}>
              {currentLevelData?.bloodSugar === 'low' ? '65' : currentLevelData?.bloodSugar === 'high' ? '220' : '110'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <Progress value={getEnergyValue()} className="flex-1 h-2" />
            <span className={`text-[10px] font-bold w-8 text-center ${
              currentLevelData?.energy === 'low' ? 'text-orange-400' : 'text-green-400'
            }`}>
              {currentLevelData?.energy === 'low' ? 'Low' : 'OK'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
            <Coins className="w-3 h-3 text-yellow-500" />
            <span className="font-bold text-xs text-yellow-600">10</span>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            currentLevelData?.bloodSugar === 'low' ? 'bg-orange-500/20 text-orange-500' :
            currentLevelData?.bloodSugar === 'high' ? 'bg-red-500/20 text-red-500' :
            currentLevelData?.energy === 'low' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-green-500/20 text-green-500'
          }`}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden"
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-green-600" />
        
        <div className="absolute top-0 left-0 w-20 h-32 bg-gradient-to-br from-green-700 to-green-800 rounded-br-[80px] opacity-90" />
        <div className="absolute top-0 right-0 w-20 h-32 bg-gradient-to-bl from-green-700 to-green-800 rounded-bl-[80px] opacity-90" />
        <div className="absolute top-8 left-6 w-16 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-br-[60px] opacity-80" />
        <div className="absolute top-8 right-6 w-16 h-24 bg-gradient-to-bl from-green-600 to-green-700 rounded-bl-[60px] opacity-80" />
        
        <motion.div
          className="absolute bottom-0"
          style={{ width: '50%', height: '100%', left: '25%' }}
          animate={{ y: worldScrollY * 0.5 }}
          transition={{ type: "spring", damping: 22, stiffness: 90, delay: 0.2 }}
        >
          <div
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(90deg, #4a3520 0%, #6b4c2a 15%, #8b6b3d 30%, #a67c4e 50%, #8b6b3d 70%, #6b4c2a 85%, #4a3520 100%)',
            }}
          >
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute left-0 right-0"
                style={{ 
                  top: `${i * 5}%`,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 80%, transparent 100%)'
                }}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <div 
                key={`v${i}`}
                className="absolute top-0 bottom-0"
                style={{ 
                  left: `${15 + i * 18}%`,
                  width: '3px',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)'
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="absolute left-0 top-[30%] w-[22%] h-6 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 rounded-r-lg shadow-lg" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-r-lg" />
        </div>
        <div className="absolute right-0 top-[50%] w-[22%] h-6 bg-gradient-to-l from-amber-800 via-amber-700 to-amber-600 rounded-l-lg shadow-lg" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-l-lg" />
        </div>
        <div className="absolute left-0 top-[75%] w-[18%] h-5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 rounded-r-lg shadow-lg" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-r-lg" />
        </div>

        <motion.div
          className="absolute z-20"
          style={{ top: '20%', left: '12%', width: '65%' }}
          animate={
            gameState === 'falling' 
              ? { y: [0, -30, 400], rotate: [0, -20, 360] }
              : { y: [0, -6, 0] }
          }
          transition={
            gameState === 'falling'
              ? { duration: 1.4, ease: [0.4, 0, 1, 1] }
              : { repeat: Infinity, duration: 2 }
          }
        >
          <div className="relative h-10 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 rounded-lg shadow-xl" style={{ boxShadow: '0 6px 12px rgba(0,0,0,0.4)' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-lg" />
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 bg-amber-900/30 rounded-full" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-6 bg-amber-700 rounded-l-lg" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-6 bg-amber-700 rounded-r-lg" />
          </div>
          
          <motion.div 
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            animate={
              gameState === 'jumping'
                ? { y: [0, -80, -80, 0], scale: [1, 1.15, 1.15, 1] }
                : { y: 0, scale: 1 }
            }
            transition={
              gameState === 'jumping'
                ? { duration: 0.7, times: [0, 0.3, 0.6, 1], ease: "easeOut" }
                : { duration: 0.3 }
            }
          >
            <motion.div 
              className="w-20 h-20 rounded-full bg-gradient-to-b from-white to-gray-100 shadow-2xl flex items-center justify-center border-4 border-orange-300"
            >
              <Cat className="w-12 h-12 text-orange-400" />
            </motion.div>
            {gameState === 'jumping' && (
              <>
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1"
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 rounded-full blur-sm"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </>
            )}
            {gameState === 'falling' && (
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, y: -20 }}
              >
                <XCircle className="w-8 h-8 text-red-500" />
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {gameState !== 'jumping' && (
            <motion.div 
              key={currentLevel}
              className="absolute z-10"
              style={{ top: '52%', left: '5%', width: '90%' }}
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", damping: 18, stiffness: 150 }}
            >
              <div className="relative h-20 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 rounded-xl shadow-2xl" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent rounded-xl" />
                <div className="absolute left-3 right-3 top-2 h-1 bg-amber-900/20 rounded-full" />
                <div className="absolute left-3 right-3 bottom-2 h-1 bg-amber-900/20 rounded-full" />
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-5 h-10 bg-amber-700 rounded-l-lg shadow-lg" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-10 bg-amber-700 rounded-r-lg shadow-lg" />
                
                <div className="absolute inset-0 flex items-center justify-around px-6">
                  {logOptions.map((option, optIndex) => {
                    const Icon = actionIcons[option.action];
                    const isSelected = selectedLogIndex === optIndex;
                    
                    return (
                      <motion.button
                        key={`${currentLevel}-${optIndex}-${option.action}`}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-green-500/40' : 'bg-transparent'
                        }`}
                        onClick={() => handleLogClick(optIndex, option.isCorrect)}
                        disabled={gameState !== 'playing'}
                        whileHover={gameState === 'playing' ? { scale: 1.15, y: -5 } : {}}
                        whileTap={gameState === 'playing' ? { scale: 0.9 } : {}}
                        data-testid={`button-tree-${option.action}`}
                      >
                        <motion.div
                          className="p-2 bg-white/90 rounded-lg shadow-lg"
                          animate={gameState === 'playing' ? { 
                            y: [0, -3, 0],
                          } : {}}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5,
                            delay: optIndex * 0.2
                          }}
                        >
                          <Icon className="w-7 h-7 text-amber-700" />
                        </motion.div>
                        <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg text-center leading-tight max-w-[70px]">
                          {actionLabels[option.action]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm z-30">
          {[...Array(maxLevel)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < currentLevel 
                  ? 'bg-green-400' 
                  : i === currentLevel 
                  ? 'bg-yellow-400' 
                  : 'bg-white/30'
              }`}
              animate={i === currentLevel ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          ))}
        </div>

        <motion.div 
          className="absolute top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-4 py-1.5 rounded-full z-30"
          key={currentLevel}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {t.games.level} {currentLevel + 1}/{maxLevel}
        </motion.div>
      </div>

      <div className="p-2.5 bg-gradient-to-t from-emerald-900/70 to-emerald-800/40">
        <p className="text-center text-xs text-white font-medium">
          {t.games.whatToDo}
        </p>
      </div>
    </div>
  );
}

function ScenarioGame({ onBack }: { onBack: () => void }) {
  const { t, isRTL } = useLanguage();
  const scenarios = getScenarios(t);
  const [hearts, setHearts] = useState(5);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong' | 'gameover' | 'victory'>('playing');
  const [shuffledScenarios] = useState(() => [...scenarios].sort(() => Math.random() - 0.5).slice(0, 10));

  const currentScenario = shuffledScenarios[currentIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
      setGameState('correct');
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setGameState('wrong');
      if (newHearts <= 0) {
        setTimeout(() => setGameState('gameover'), 1500);
        return;
      }
    }

    setTimeout(() => {
      if (currentIndex + 1 >= shuffledScenarios.length) {
        setGameState('victory');
      } else {
        setCurrentIndex(currentIndex + 1);
        setGameState('playing');
      }
    }, 1500);
  };

  const resetGame = () => {
    setHearts(5);
    setCurrentIndex(0);
    setScore(0);
    setGameState('playing');
  };

  if (gameState === 'gameover') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ repeat: 2, duration: 0.5 }}
        >
          <XCircle className="w-24 h-24 text-red-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-red-500 mb-2">{t.games.gameOver}</h2>
        <p className="text-muted-foreground mb-2">{t.games.ranOutHearts}</p>
        <p className="text-lg font-semibold mb-6">{t.games.score}: {score}/{shuffledScenarios.length}</p>
        <div className="flex gap-3">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.tryAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'victory') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full text-center p-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 0.8 }}
        >
          <Trophy className="w-24 h-24 text-yellow-500 mb-4" />
        </motion.div>
        <h2 className="text-3xl font-bold text-yellow-500 mb-2">{t.games.youWin}</h2>
        <p className="text-muted-foreground mb-2">{t.games.amazingJob}</p>
        <p className="text-lg font-semibold mb-2">{t.games.score}: {score}/{shuffledScenarios.length}</p>
        <div className="flex items-center gap-1 mb-6">
          {Array.from({ length: hearts }).map((_, i) => (
            <Heart key={i} className="w-6 h-6 text-red-500 fill-red-500" />
          ))}
        </div>
        <div className="flex gap-3">
          <Button onClick={resetGame} className="rounded-xl">
            <Star className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.games.playAgain}
          </Button>
          <Button variant="outline" onClick={onBack} className="rounded-xl">
            {t.games.backToGames}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <X className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={i >= hearts ? { scale: [1, 0], opacity: [1, 0] } : { scale: 1, opacity: 1 }}
            >
              <Heart 
                className={`w-6 h-6 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-sm">{score}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-xs text-muted-foreground mb-4">
          {t.games.question} {currentIndex + 1} {t.games.of} {shuffledScenarios.length}
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'correct' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-sm z-10"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
              <p className="text-xl font-bold text-green-600">{t.games.correct}</p>
              <p className="text-sm text-muted-foreground mt-2 px-6 text-center max-w-xs">
                {currentScenario.explanation}
              </p>
            </motion.div>
          )}
          {gameState === 'wrong' && hearts > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20 backdrop-blur-sm z-10"
            >
              <XCircle className="w-20 h-20 text-red-500 mb-4" />
              <p className="text-xl font-bold text-red-600">{t.games.oops}</p>
              <p className="text-sm text-muted-foreground mt-2 px-6 text-center max-w-xs">
                {currentScenario.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <p className="text-lg font-medium leading-relaxed">{currentScenario.question}</p>
            </div>
          </Card>

          <div className="space-y-3">
            {currentScenario.options.map((option, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-16 text-left justify-start px-6 rounded-2xl text-base font-medium"
                  onClick={() => handleAnswer(option.correct)}
                  disabled={gameState !== 'playing'}
                  data-testid={`button-option-${idx}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-4 shrink-0">
                    <span className="font-bold text-primary">{String.fromCharCode(65 + idx)}</span>
                  </div>
                  {option.text}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function GamesMenu({ isOpen, onClose, petId }: GamesMenuProps) {
  const { t, isRTL } = useLanguage();
  const [activeGame, setActiveGame] = useState<'menu' | 'scenarios' | 'safetyRoutine' | 'treeClimb'>('menu');

  const handleClose = () => {
    setActiveGame('menu');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 z-50 bg-card flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {activeGame === 'menu' ? (
        <>
          <div className="pt-12 px-6 pb-4 flex items-center justify-between border-b border-white/10">
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              {t.games.title}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className="p-5 cursor-pointer hover-elevate bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20"
                onClick={() => setActiveGame('scenarios')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.solveScenarios}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.testKnowledge}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="p-5 cursor-pointer hover-elevate bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20"
                onClick={() => setActiveGame('safetyRoutine')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.safetyRoutine}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.safetyRoutineDesc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-500">+5</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                className="p-5 cursor-pointer hover-elevate bg-gradient-to-br from-amber-500/10 to-lime-500/10 border-amber-500/20"
                onClick={() => setActiveGame('treeClimb')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-lime-500 flex items-center justify-center shadow-lg">
                    <TreePine className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.treeClimb}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.treeClimbDesc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-medium text-yellow-500">+10</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-5 opacity-60 bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Puzzle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.sugarMatch}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.matchFoods}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500">{t.games.soon}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-5 opacity-60 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.insulinChallenge}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.calculateDose}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500">{t.games.soon}</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-5 opacity-60 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border-pink-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{t.games.speedCheck}</h3>
                    <p className="text-sm text-muted-foreground">{t.games.quickDecisions}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500">{t.games.soon}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      ) : activeGame === 'scenarios' ? (
        <ScenarioGame onBack={() => setActiveGame('menu')} />
      ) : activeGame === 'safetyRoutine' ? (
        <SafetyRoutineGame onBack={() => setActiveGame('menu')} petId={petId} />
      ) : activeGame === 'treeClimb' ? (
        <TreeClimbGame onBack={() => setActiveGame('menu')} petId={petId} />
      ) : null}
    </motion.div>
  );
}
