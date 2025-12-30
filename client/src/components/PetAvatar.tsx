import { motion } from "framer-motion";
import { Pet } from "@shared/schema";
import { HeartPulse, ArrowDownAZ } from "lucide-react";

// In a real app, these would be proper SVG illustrations or images
// For now, we'll use emojis or simple shapes composed beautifully

interface PetAvatarProps {
  pet: Pet;
}

export function PetAvatar({ pet }: PetAvatarProps) {
  // Determine mood-based expression
  let expression = "😊";
  if (pet.isAsleep) expression = "😴";
  else if (pet.bloodSugar < 70) expression = "😵"; // Low sugar
  else if (pet.bloodSugar > 180) expression = "🤢"; // High sugar
  else if (pet.mood === "happy") expression = "😄";
  else if (pet.mood === "sad") expression = "😢";

  // Animation variants
  const bounce = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const sleep = {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 animate-pulse" />

      <motion.div
        animate={pet.isAsleep ? sleep : bounce}
        className="relative z-10 w-48 h-48 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center text-9xl select-none"
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
