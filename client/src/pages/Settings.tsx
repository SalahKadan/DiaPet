import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, User, Globe, Volume2, Bell, Info } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pet } from "@shared/schema";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const [, setLocation] = useLocation();
  
  const { data: pets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });
  
  const pet = pets?.[0];
  
  const [petName, setPetName] = useState("");
  const [language, setLanguage] = useState("en");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (pet?.name) {
      setPetName(pet.name);
    }
  }, [pet?.name]);

  const renameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("PATCH", `/api/pets/${pet?.id}`, { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    }
  });

  const handleSave = () => {
    if (pet && petName.trim() && petName !== pet.name) {
      renameMutation.mutate(petName.trim());
    }
  };

  if (!pet) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="relative w-full max-w-[450px] aspect-[9/19] bg-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/5"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="pt-12 px-6 pb-4 flex items-center gap-4 border-b border-white/10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Pet Name
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pet-name">What should we call your friend?</Label>
                  <Input
                    id="pet-name"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter a name..."
                    className="h-12 text-lg rounded-xl"
                    data-testid="input-pet-name"
                  />
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={!petName.trim() || petName === pet.name || renameMutation.isPending}
                  className="w-full h-12 rounded-xl"
                  data-testid="button-save-name"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {renameMutation.isPending ? "Saving..." : "Save Name"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="w-5 h-5 text-primary" />
                  Language
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-12 rounded-xl" data-testid="select-language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Volume2 className="w-5 h-5 text-primary" />
                  Sound & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-toggle" className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    Sound Effects
                  </Label>
                  <Switch 
                    id="sound-toggle" 
                    checked={soundEnabled} 
                    onCheckedChange={setSoundEnabled}
                    data-testid="switch-sound"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-toggle" className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Notifications
                  </Label>
                  <Switch 
                    id="notifications-toggle" 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                    data-testid="switch-notifications"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-primary" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><span className="font-medium text-foreground">DiaPet</span> v1.0.0</p>
                <p>A fun way to learn about diabetes management!</p>
                <p className="text-xs">Made with love for kids everywhere.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
