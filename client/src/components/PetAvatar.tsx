import { motion } from "framer-motion";
import { Pet } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PetAvatarProps {
  pet: Pet;
  className?: string;
}

export function PetAvatar({ pet, className }: PetAvatarProps) {
  const isDistressed = pet.bloodSugar < 70 || pet.bloodSugar > 180;
  const isLowEnergy = pet.energy < 30;
  const isHungry = pet.hunger > 80;
  const isUnhealthy = pet.health < 40;

  const bounce = {
    y: [0, -8, 0],
    transition: {
      duration: isDistressed ? 1 : 2.5,
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

  const shake = {
    x: [0, -2, 2, -2, 2, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "linear"
    }
  };

  const animation = pet.isAsleep ? sleep : (isDistressed ? { ...bounce, ...shake } : bounce);

  const getEyeExpression = () => {
    if (pet.isAsleep) return "sleeping";
    if (isDistressed) return "worried";
    if (isUnhealthy) return "sad";
    if (isHungry) return "hungry";
    if (isLowEnergy) return "tired";
    if (pet.mood === "happy") return "happy";
    return "normal";
  };

  const eyeExpression = getEyeExpression();

  return (
    <div className={cn("relative w-64 h-64 mx-auto flex items-center justify-center", className)}>
      <div className={cn(
        "absolute inset-0 blur-3xl rounded-full scale-75 animate-pulse",
        isDistressed ? "bg-red-500/20" : "bg-primary/20"
      )} />

      <motion.div
        animate={animation}
        className="relative z-10"
      >
        <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-2xl">
          <defs>
            <linearGradient id="catFur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD89B" />
              <stop offset="100%" stopColor="#F5C57A" />
            </linearGradient>
            <linearGradient id="catFurDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8C078" />
              <stop offset="100%" stopColor="#D4A85A" />
            </linearGradient>
            <linearGradient id="sensorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15"/>
            </filter>
          </defs>

          <ellipse cx="100" cy="150" rx="55" ry="45" fill="url(#catFur)" filter="url(#softShadow)" />

          <path d="M35 85 L55 45 L70 75 Z" fill="url(#catFur)" stroke="url(#catFurDark)" strokeWidth="2"/>
          <path d="M165 85 L145 45 L130 75 Z" fill="url(#catFur)" stroke="url(#catFurDark)" strokeWidth="2"/>
          <path d="M45 78 L55 55 L63 72 Z" fill="#FFBCD9"/>
          <path d="M155 78 L145 55 L137 72 Z" fill="#FFBCD9"/>

          <ellipse cx="100" cy="100" rx="58" ry="52" fill="url(#catFur)" filter="url(#softShadow)" />

          <ellipse cx="100" cy="115" rx="20" ry="12" fill="#FFF5E6" opacity="0.7"/>

          {eyeExpression === "sleeping" ? (
            <>
              <path d="M65 90 Q75 95 85 90" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M115 90 Q125 95 135 90" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <motion.text
                x="155"
                y="70"
                fontSize="16"
                fill="#60A5FA"
                animate={{ opacity: [0, 1, 0], y: [70, 60, 50] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                z
              </motion.text>
              <motion.text
                x="165"
                y="55"
                fontSize="12"
                fill="#60A5FA"
                animate={{ opacity: [0, 1, 0], y: [55, 45, 35] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              >
                z
              </motion.text>
            </>
          ) : (
            <>
              <ellipse cx="70" cy="90" rx="16" ry={eyeExpression === "happy" ? 10 : 18} fill="white" />
              <ellipse cx="130" cy="90" rx="16" ry={eyeExpression === "happy" ? 10 : 18} fill="white" />

              {eyeExpression === "happy" ? (
                <>
                  <path d="M58 88 Q70 95 82 88" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <path d="M118 88 Q130 95 142 88" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </>
              ) : eyeExpression === "worried" ? (
                <>
                  <ellipse cx="70" cy="92" rx="10" ry="12" fill="#5D4037" />
                  <ellipse cx="130" cy="92" rx="10" ry="12" fill="#5D4037" />
                  <ellipse cx="72" cy="88" rx="4" ry="5" fill="white" />
                  <ellipse cx="132" cy="88" rx="4" ry="5" fill="white" />
                  <path d="M55 78 L80 82" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M145 78 L120 82" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round"/>
                </>
              ) : eyeExpression === "sad" ? (
                <>
                  <ellipse cx="70" cy="94" rx="9" ry="11" fill="#5D4037" />
                  <ellipse cx="130" cy="94" rx="9" ry="11" fill="#5D4037" />
                  <ellipse cx="72" cy="90" rx="3" ry="4" fill="white" />
                  <ellipse cx="132" cy="90" rx="3" ry="4" fill="white" />
                  <path d="M58 80 Q70 85 82 80" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M118 80 Q130 85 142 80" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </>
              ) : eyeExpression === "hungry" ? (
                <>
                  <ellipse cx="70" cy="90" rx="12" ry="14" fill="#5D4037" />
                  <ellipse cx="130" cy="90" rx="12" ry="14" fill="#5D4037" />
                  <ellipse cx="73" cy="86" rx="5" ry="6" fill="white" />
                  <ellipse cx="133" cy="86" rx="5" ry="6" fill="white" />
                  <ellipse cx="70" cy="94" rx="3" ry="3" fill="white" opacity="0.5" />
                  <ellipse cx="130" cy="94" rx="3" ry="3" fill="white" opacity="0.5" />
                </>
              ) : eyeExpression === "tired" ? (
                <>
                  <ellipse cx="70" cy="92" rx="8" ry="10" fill="#5D4037" />
                  <ellipse cx="130" cy="92" rx="8" ry="10" fill="#5D4037" />
                  <ellipse cx="72" cy="88" rx="3" ry="4" fill="white" />
                  <ellipse cx="132" cy="88" rx="3" ry="4" fill="white" />
                  <path d="M54 85 L86 82" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M146 85 L114 82" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <ellipse cx="70" cy="90" rx="11" ry="14" fill="#5D4037" />
                  <ellipse cx="130" cy="90" rx="11" ry="14" fill="#5D4037" />
                  <ellipse cx="73" cy="86" rx="5" ry="6" fill="white" />
                  <ellipse cx="133" cy="86" rx="5" ry="6" fill="white" />
                  <ellipse cx="70" cy="93" rx="2" ry="2" fill="white" opacity="0.4" />
                  <ellipse cx="130" cy="93" rx="2" ry="2" fill="white" opacity="0.4" />
                </>
              )}
            </>
          )}

          <ellipse cx="100" cy="112" rx="6" ry="4" fill="#FFBCD9" />
          <path d="M100 116 L100 122" stroke="#D4A05A" strokeWidth="1.5"/>

          {eyeExpression !== "sleeping" && (
            <path 
              d={eyeExpression === "happy" || eyeExpression === "hungry" 
                ? "M90 122 Q100 132 110 122" 
                : eyeExpression === "worried" || eyeExpression === "sad"
                ? "M92 128 Q100 122 108 128"
                : "M92 125 Q100 128 108 125"
              } 
              stroke="#5D4037" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none"
            />
          )}

          <line x1="45" y1="108" x2="20" y2="100" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="45" y1="115" x2="18" y2="115" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="45" y1="122" x2="20" y2="130" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="155" y1="108" x2="180" y2="100" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="155" y1="115" x2="182" y2="115" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="155" y1="122" x2="180" y2="130" stroke="#D4A85A" strokeWidth="1.5" strokeLinecap="round"/>

          <g transform="translate(140, 130)">
            <ellipse cx="0" cy="0" rx="14" ry="10" fill="url(#sensorGrad)" filter="url(#softShadow)"/>
            <ellipse cx="0" cy="0" rx="10" ry="7" fill="#93C5FD" />
            <ellipse cx="-2" cy="-2" rx="3" ry="2" fill="white" opacity="0.6"/>
            <motion.ellipse 
              cx="4" 
              cy="2" 
              rx="2" 
              ry="2" 
              fill={isDistressed ? "#EF4444" : "#22C55E"}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <rect x="-2" y="8" width="4" height="6" rx="1" fill="#60A5FA" />
          </g>

          {isDistressed && (
            <motion.g
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <circle cx="55" cy="105" r="3" fill="#60A5FA" opacity="0.7"/>
              <circle cx="145" cy="105" r="3" fill="#60A5FA" opacity="0.7"/>
            </motion.g>
          )}
        </svg>
      </motion.div>
      
      <div className="absolute -bottom-4 bg-primary text-primary-foreground px-6 py-2 rounded-full font-display text-xl font-bold shadow-lg border-4 border-white">
        {pet.name}
      </div>
    </div>
  );
}
