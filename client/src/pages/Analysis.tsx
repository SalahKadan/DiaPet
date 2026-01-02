import { useQuery, useMutation } from "@tanstack/react-query";
import { Pet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Activity, Utensils, Zap, Brain, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Analysis() {
  const { t, isRTL } = useLanguage();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const pet = pets?.[0];

  const generateMockHistory = (pet: Pet) => {
    const now = Date.now();
    const history = [];
    let bloodSugar = pet.bloodSugar;
    let health = pet.health;
    let hunger = pet.hunger;
    let energy = pet.energy;

    for (let i = 23; i >= 0; i--) {
      const variation = () => Math.floor(Math.random() * 20) - 10;
      bloodSugar = Math.max(50, Math.min(300, bloodSugar + variation()));
      health = Math.max(0, Math.min(100, health + (Math.random() * 6 - 3)));
      hunger = Math.max(0, Math.min(100, hunger + (Math.random() * 10 - 5)));
      energy = Math.max(0, Math.min(100, energy + (Math.random() * 8 - 4)));

      history.push({
        time: new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bloodSugar: Math.round(bloodSugar),
        health: Math.round(health),
        hunger: Math.round(hunger),
        energy: Math.round(energy),
      });
    }

    history.push({
      time: t.analysis.now,
      bloodSugar: pet.bloodSugar,
      health: pet.health,
      hunger: pet.hunger,
      energy: pet.energy,
    });

    return history;
  };

  const fetchRecommendations = async () => {
    if (!pet) return;
    setIsLoadingRecs(true);
    try {
      const res = await apiRequest("POST", `/api/pets/${pet.id}/recommendations`);
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      setRecommendations([t.analysis.unableToGenerate]);
    }
    setIsLoadingRecs(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-blue-400">{t.analysis.loadingAnalysis}</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <p className="text-gray-400">{t.analysis.noPetFound}</p>
      </div>
    );
  }

  const history = generateMockHistory(pet);

  const getStatusColor = (value: number, type: 'bloodSugar' | 'stat') => {
    if (type === 'bloodSugar') {
      if (value < 70) return "text-orange-500";
      if (value > 180) return "text-red-500";
      return "text-green-500";
    }
    if (value < 30) return "text-red-500";
    if (value < 60) return "text-orange-500";
    return "text-green-500";
  };

  const getTrend = (current: number, avg: number) => {
    const diff = current - avg;
    if (diff > 5) return { icon: TrendingUp, color: "text-green-500", text: t.analysis.rising };
    if (diff < -5) return { icon: TrendingDown, color: "text-red-500", text: t.analysis.falling };
    return { icon: Minus, color: "text-gray-500", text: t.analysis.stable };
  };

  const avgBloodSugar = Math.round(history.reduce((a, b) => a + b.bloodSugar, 0) / history.length);
  const avgHealth = Math.round(history.reduce((a, b) => a + b.health, 0) / history.length);
  const bloodSugarTrend = getTrend(pet.bloodSugar, avgBloodSugar);
  const BloodSugarTrendIcon = bloodSugarTrend.icon;

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-950 p-4 pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = "/pet"} className="text-gray-300 hover:text-white" data-testid="button-back">
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-2xl font-display font-bold text-blue-400">{t.analysis.title}</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-gradient-to-br from-pink-900/40 to-gray-800 border-pink-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-gray-400">{t.analysis.health}</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.health, 'stat')}`}>
                {pet.health}%
              </div>
              <div className="text-xs text-gray-500">{t.analysis.avg}: {avgHealth}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/40 to-gray-800 border-red-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">{t.analysis.bloodSugar}</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.bloodSugar, 'bloodSugar')}`}>
                {pet.bloodSugar}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <BloodSugarTrendIcon className={`w-3 h-3 ${bloodSugarTrend.color}`} />
                <span className={bloodSugarTrend.color}>{bloodSugarTrend.text}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/40 to-gray-800 border-orange-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">{t.analysis.hunger}</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.hunger, 'stat')}`}>
                {pet.hunger}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/40 to-gray-800 border-yellow-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">{t.analysis.energy}</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.energy, 'stat')}`}>
                {pet.energy}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-800/80 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                <Activity className="w-5 h-5 text-red-400" />
                {t.analysis.bloodSugarHistory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="bloodSugarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
                    <YAxis domain={[50, 300]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31,41,55,0.95)', 
                        borderRadius: '12px',
                        border: '1px solid #374151',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bloodSugar" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      fill="url(#bloodSugarGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded" />
                  <span className="text-gray-400">{t.analysis.normal}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-600 rounded" />
                  <span className="text-gray-400">{t.analysis.high}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/80 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                <Heart className="w-5 h-5 text-pink-400" />
                {t.analysis.vitalsOverview}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31,41,55,0.95)', 
                        borderRadius: '12px',
                        border: '1px solid #374151',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        color: '#f3f4f6'
                      }} 
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Line type="monotone" dataKey="health" stroke="#ec4899" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="hunger" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/40 to-gray-800 border-purple-800/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-100">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {t.analysis.aiRecommendations}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchRecommendations}
                  disabled={isLoadingRecs}
                  className="text-gray-400 hover:text-white"
                  data-testid="button-get-recommendations"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRecs ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 && !isLoadingRecs ? (
                <div className="text-center py-6">
                  <Brain className="w-12 h-12 mx-auto text-purple-500/50 mb-3" />
                  <p className="text-sm text-gray-400 mb-4">
                    {t.analysis.getPersonalized}
                  </p>
                  <Button onClick={fetchRecommendations} className="bg-purple-600 hover:bg-purple-700" data-testid="button-analyze">
                    <Brain className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t.analysis.analyzePatterns}
                  </Button>
                </div>
              ) : isLoadingRecs ? (
                <div className="text-center py-6">
                  <RefreshCw className="w-8 h-8 mx-auto text-purple-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-400">{t.analysis.analyzingPatterns}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-xl"
                    >
                      <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-purple-400">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-200">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-800/80 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-100">{t.analysis.quickStats}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">{t.analysis.level}</p>
                  <p className="font-bold text-lg text-gray-100">{pet.level}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t.analysis.experience}</p>
                  <p className="font-bold text-lg text-gray-100">{pet.experience}/100 XP</p>
                </div>
                <div>
                  <p className="text-gray-400">{t.analysis.coins}</p>
                  <p className="font-bold text-lg text-yellow-400">{pet.coins}</p>
                </div>
                <div>
                  <p className="text-gray-400">{t.analysis.mood}</p>
                  <p className="font-bold text-lg text-gray-100 capitalize">{pet.mood}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
