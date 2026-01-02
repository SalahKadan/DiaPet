import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Brain, Puzzle, Target, Clock, Lock, Heart, Trophy, Star, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

export function GamesMenu({ isOpen, onClose }: GamesMenuProps) {
  const { t, isRTL } = useLanguage();
  const [activeGame, setActiveGame] = useState<'menu' | 'scenarios'>('menu');

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
              transition={{ delay: 0.3 }}
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
              transition={{ delay: 0.4 }}
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
      ) : (
        <ScenarioGame onBack={() => setActiveGame('menu')} />
      )}
    </motion.div>
  );
}
