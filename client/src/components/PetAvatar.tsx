import { motion } from "framer-motion";
import { Pet } from "@shared/schema";
import { HeartPulse, ArrowDownAZ } from "lucide-react";
import { cn } from "@/lib/utils";

// In a real app, these would be proper SVG illustrations or images
// For now, we'll use emojis or simple shapes composed beautifully

interface PetAvatarProps {
  pet: Pet;
  className?: string;
}

export function PetAvatar({ pet, className }: PetAvatarProps) {
  // Determine mood-based expression
  let expression = "😊";
  if (pet.isAsleep) expression = "😴";
  else if (pet.bloodSugar < 70) expression = "😵"; // Low sugar
  else if (pet.bloodSugar > 180) expression = "🤢"; // High sugar
  else if (pet.health < 40) expression = "😟"; // Poor health
  else if (pet.hunger > 80) expression = "🤤"; // Very hungry
  else if (pet.energy < 30) expression = "🥱"; // Low energy
  else if (pet.mood === "happy") expression = "😄";
  else if (pet.mood === "sad") expression = "😢";

  // Animation variants
  const bounce = {
    y: [0, -10, 0],
    scale: pet.health < 40 ? [1, 0.98, 1] : [1, 1.05, 1],
    transition: {
      duration: pet.bloodSugar < 70 || pet.bloodSugar > 180 ? 1 : 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const shake = {
    x: [0, -2, 2, -2, 2, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "linear"
    }
  };

  const animation = pet.isAsleep ? sleep : (pet.bloodSugar < 70 || pet.bloodSugar > 180 ? { ...bounce, ...shake } : bounce);

  return (
    <div className={cn("relative w-64 h-64 mx-auto flex items-center justify-center", className)}>
      {/* Background Glow */}
      <div className={cn(
        "absolute inset-0 blur-3xl rounded-full scale-75 animate-pulse",
        pet.bloodSugar < 70 || pet.bloodSugar > 180 ? "bg-red-500/20" : "bg-primary/20"
      )} />

      <motion.div
        animate={animation}
        className={cn(
          "relative z-10 w-48 h-48 bg-white rounded-full shadow-2xl border-4 flex items-center justify-center text-9xl select-none",
          pet.bloodSugar < 70 || pet.bloodSugar > 180 ? "border-red-200" : "border-white"
        )}
      >
        {expression}
        
        {/* Status Indicators overlaid on avatar */}
        {pet.isAsleep && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -20, x: 20 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-4 -right-4"
          >
            <ArrowDownAZ className="w-8 h-8 text-blue-400 fill-current" />
          </motion.div>
        )}

        {pet.bloodSugar < 70 && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute bottom-0 right-0 bg-red-100 p-2 rounded-full border border-red-200"
          >
            <HeartPulse className="w-8 h-8 text-red-500" />
          </motion.div>
        )}
      </motion.div>
      
      {/* Name Tag */}
      <div className="absolute -bottom-4 bg-primary text-primary-foreground px-6 py-2 rounded-full font-display text-xl font-bold shadow-lg border-4 border-white">
        {pet.name}
      </div>
    </div>
  );
}
