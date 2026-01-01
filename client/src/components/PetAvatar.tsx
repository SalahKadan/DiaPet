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
        isDistressed ? "bg-red-500/20" : "bg-blue-400/20"
      )} />

      <motion.div
        animate={animation}
        className="relative z-10"
      >
        <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-2xl">
          <defs>
            <linearGradient id="ragdollFur" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5F0EB" />
            </linearGradient>
            <linearGradient id="ragdollFurShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EDE8E3" />
              <stop offset="100%" stopColor="#E0D8D0" />
            </linearGradient>
            <linearGradient id="blueEyes" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="sensorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15"/>
            </filter>
            <filter id="fluffyEdge" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>

          <ellipse cx="100" cy="155" rx="58" ry="42" fill="url(#ragdollFur)" filter="url(#softShadow)" />
          <ellipse cx="70" cy="160" rx="12" ry="8" fill="url(#ragdollFurShadow)" opacity="0.5"/>
          <ellipse cx="130" cy="160" rx="12" ry="8" fill="url(#ragdollFurShadow)" opacity="0.5"/>

          <path d="M30 90 L48 40 L62 72 Z" fill="url(#ragdollFur)" stroke="url(#ragdollFurShadow)" strokeWidth="1"/>
          <path d="M170 90 L152 40 L138 72 Z" fill="url(#ragdollFur)" stroke="url(#ragdollFurShadow)" strokeWidth="1"/>
          <path d="M40 78 L48 52 L55 72 Z" fill="#FFCDD2"/>
          <path d="M160 78 L152 52 L145 72 Z" fill="#FFCDD2"/>
          
          <ellipse cx="32" cy="75" rx="8" ry="6" fill="url(#ragdollFur)" opacity="0.8"/>
          <ellipse cx="168" cy="75" rx="8" ry="6" fill="url(#ragdollFur)" opacity="0.8"/>
          <ellipse cx="28" cy="85" rx="6" ry="5" fill="url(#ragdollFur)" opacity="0.6"/>
          <ellipse cx="172" cy="85" rx="6" ry="5" fill="url(#ragdollFur)" opacity="0.6"/>

          <ellipse cx="100" cy="100" rx="60" ry="55" fill="url(#ragdollFur)" filter="url(#softShadow)" />
          
          <ellipse cx="45" cy="95" rx="12" ry="10" fill="url(#ragdollFur)" opacity="0.9"/>
          <ellipse cx="155" cy="95" rx="12" ry="10" fill="url(#ragdollFur)" opacity="0.9"/>
          <ellipse cx="40" cy="105" rx="8" ry="7" fill="url(#ragdollFur)" opacity="0.7"/>
          <ellipse cx="160" cy="105" rx="8" ry="7" fill="url(#ragdollFur)" opacity="0.7"/>

          <ellipse cx="100" cy="118" rx="22" ry="14" fill="#FFF8F5" opacity="0.9"/>

          {eyeExpression === "sleeping" ? (
            <>
              <path d="M60 92 Q72 98 84 92" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M116 92 Q128 98 140 92" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" fill="none"/>
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
              <ellipse cx="70" cy="90" rx="18" ry={eyeExpression === "happy" ? 12 : 20} fill="white" stroke="#E8E0D8" strokeWidth="1" />
              <ellipse cx="130" cy="90" rx="18" ry={eyeExpression === "happy" ? 12 : 20} fill="white" stroke="#E8E0D8" strokeWidth="1" />

              {eyeExpression === "happy" ? (
                <>
                  <path d="M56 88 Q70 98 84 88" stroke="url(#blueEyes)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                  <path d="M116 88 Q130 98 144 88" stroke="url(#blueEyes)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                </>
              ) : eyeExpression === "worried" ? (
                <>
                  <ellipse cx="70" cy="92" rx="11" ry="14" fill="url(#blueEyes)" />
                  <ellipse cx="130" cy="92" rx="11" ry="14" fill="url(#blueEyes)" />
                  <ellipse cx="67" cy="88" rx="4" ry="5" fill="white" />
                  <ellipse cx="127" cy="88" rx="4" ry="5" fill="white" />
                  <circle cx="73" cy="95" r="2" fill="white" opacity="0.5"/>
                  <circle cx="133" cy="95" r="2" fill="white" opacity="0.5"/>
                  <path d="M52 78 L82 84" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M148 78 L118 84" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
                </>
              ) : eyeExpression === "sad" ? (
                <>
                  <ellipse cx="70" cy="94" rx="10" ry="12" fill="url(#blueEyes)" />
                  <ellipse cx="130" cy="94" rx="10" ry="12" fill="url(#blueEyes)" />
                  <ellipse cx="67" cy="90" rx="4" ry="5" fill="white" />
                  <ellipse cx="127" cy="90" rx="4" ry="5" fill="white" />
                  <path d="M55 80 Q70 86 85 80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M115 80 Q130 86 145 80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </>
              ) : eyeExpression === "hungry" ? (
                <>
                  <ellipse cx="70" cy="90" rx="13" ry="16" fill="url(#blueEyes)" />
                  <ellipse cx="130" cy="90" rx="13" ry="16" fill="url(#blueEyes)" />
                  <ellipse cx="67" cy="85" rx="5" ry="6" fill="white" />
                  <ellipse cx="127" cy="85" rx="5" ry="6" fill="white" />
                  <circle cx="73" cy="94" r="3" fill="white" opacity="0.4"/>
                  <circle cx="133" cy="94" r="3" fill="white" opacity="0.4"/>
                </>
              ) : eyeExpression === "tired" ? (
                <>
                  <ellipse cx="70" cy="92" rx="9" ry="11" fill="url(#blueEyes)" />
                  <ellipse cx="130" cy="92" rx="9" ry="11" fill="url(#blueEyes)" />
                  <ellipse cx="67" cy="88" rx="4" ry="5" fill="white" />
                  <ellipse cx="127" cy="88" rx="4" ry="5" fill="white" />
                  <path d="M52 84 L88 80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M148 84 L112 80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round"/>
                </>
              ) : (
                <>
                  <ellipse cx="70" cy="90" rx="12" ry="15" fill="url(#blueEyes)" />
                  <ellipse cx="130" cy="90" rx="12" ry="15" fill="url(#blueEyes)" />
                  <ellipse cx="67" cy="85" rx="5" ry="6" fill="white" />
                  <ellipse cx="127" cy="85" rx="5" ry="6" fill="white" />
                  <circle cx="73" cy="93" r="2.5" fill="white" opacity="0.4"/>
                  <circle cx="133" cy="93" r="2.5" fill="white" opacity="0.4"/>
                </>
              )}
            </>
          )}

          <ellipse cx="100" cy="115" rx="7" ry="5" fill="#FFCDD2" />
          <path d="M100 120 L100 126" stroke="#E0D0C8" strokeWidth="1.5"/>

          {eyeExpression !== "sleeping" && (
            <path 
              d={eyeExpression === "happy" || eyeExpression === "hungry" 
                ? "M88 126 Q100 138 112 126" 
                : eyeExpression === "worried" || eyeExpression === "sad"
                ? "M90 132 Q100 126 110 132"
                : "M90 128 Q100 132 110 128"
              } 
              stroke="#C4A494" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none"
            />
          )}

          <line x1="42" y1="112" x2="15" y2="104" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="42" y1="118" x2="12" y2="118" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="42" y1="124" x2="15" y2="132" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="158" y1="112" x2="185" y2="104" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="158" y1="118" x2="188" y2="118" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="158" y1="124" x2="185" y2="132" stroke="#E0D8D0" strokeWidth="1.5" strokeLinecap="round"/>

          <g transform="translate(145, 135)">
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
              <circle cx="52" cy="108" r="3" fill="#60A5FA" opacity="0.7"/>
              <circle cx="148" cy="108" r="3" fill="#60A5FA" opacity="0.7"/>
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
