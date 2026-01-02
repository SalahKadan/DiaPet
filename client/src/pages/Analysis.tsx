import { useQuery, useMutation } from "@tanstack/react-query";
import { Pet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Activity, Utensils, Zap, Brain, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Analysis() {
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
      time: "Now",
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
      setRecommendations(["Unable to generate recommendations at this time."]);
    }
    setIsLoadingRecs(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading analysis...</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <p>No pet found</p>
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
    if (diff > 5) return { icon: TrendingUp, color: "text-green-500", text: "Rising" };
    if (diff < -5) return { icon: TrendingDown, color: "text-red-500", text: "Falling" };
    return { icon: Minus, color: "text-gray-500", text: "Stable" };
  };

  const avgBloodSugar = Math.round(history.reduce((a, b) => a + b.bloodSugar, 0) / history.length);
  const avgHealth = Math.round(history.reduce((a, b) => a + b.health, 0) / history.length);
  const bloodSugarTrend = getTrend(pet.bloodSugar, avgBloodSugar);
  const BloodSugarTrendIcon = bloodSugarTrend.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = "/pet"} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold text-primary">Health Analysis</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-xs text-muted-foreground">Health</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.health, 'stat')}`}>
                {pet.health}%
              </div>
              <div className="text-xs text-muted-foreground">Avg: {avgHealth}%</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Blood Sugar</span>
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

          <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Hunger</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(pet.hunger, 'stat')}`}>
                {pet.hunger}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-muted-foreground">Energy</span>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Blood Sugar History (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="bloodSugarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis domain={[50, 300]} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
                  <div className="w-3 h-3 bg-green-200 rounded" />
                  <span className="text-muted-foreground">Normal (70-180)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-200 rounded" />
                  <span className="text-muted-foreground">High (&gt;180)</span>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Vitals Overview (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend />
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
          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Recommendations
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchRecommendations}
                  disabled={isLoadingRecs}
                  data-testid="button-get-recommendations"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRecs ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 && !isLoadingRecs ? (
                <div className="text-center py-6">
                  <Brain className="w-12 h-12 mx-auto text-purple-300 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Get personalized recommendations based on your pet's health patterns
                  </p>
                  <Button onClick={fetchRecommendations} className="bg-purple-500 hover:bg-purple-600" data-testid="button-analyze">
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Patterns
                  </Button>
                </div>
              ) : isLoadingRecs ? (
                <div className="text-center py-6">
                  <RefreshCw className="w-8 h-8 mx-auto text-purple-500 animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing health patterns...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl"
                    >
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{rec}</p>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-bold text-lg">{pet.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-bold text-lg">{pet.experience}/100 XP</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Coins</p>
                  <p className="font-bold text-lg">{pet.coins}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mood</p>
                  <p className="font-bold text-lg capitalize">{pet.mood}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
