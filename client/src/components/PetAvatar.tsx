import { motion } from "framer-motion";
import { Pet } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EquippedItem {
  itemId: string;
  equipped: boolean;
}

interface PetAvatarProps {
  pet: Pet;
  className?: string;
  equippedItems?: EquippedItem[];
}

export function PetAvatar({ pet, className, equippedItems = [] }: PetAvatarProps) {
  const hasItem = (itemId: string) => equippedItems.some(item => item.itemId === itemId);
  const isDistressed = pet.bloodSugar < 70 || pet.bloodSugar > 180;
  const isLowEnergy = pet.energy < 30;
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
    if (isLowEnergy) return "tired";
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

          <path d="M35 85 Q30 55 50 45 Q65 50 60 75 Q55 85 45 88 Z" fill="url(#ragdollFur)" stroke="url(#ragdollFurShadow)" strokeWidth="1"/>
          <path d="M165 85 Q170 55 150 45 Q135 50 140 75 Q145 85 155 88 Z" fill="url(#ragdollFur)" stroke="url(#ragdollFurShadow)" strokeWidth="1"/>
          <path d="M42 78 Q40 62 50 55 Q58 60 55 75 Z" fill="#FFCDD2"/>
          <path d="M158 78 Q160 62 150 55 Q142 60 145 75 Z" fill="#FFCDD2"/>
          
          <ellipse cx="30" cy="78" rx="6" ry="5" fill="url(#ragdollFur)" opacity="0.8"/>
          <ellipse cx="170" cy="78" rx="6" ry="5" fill="url(#ragdollFur)" opacity="0.8"/>
          <ellipse cx="26" cy="86" rx="5" ry="4" fill="url(#ragdollFur)" opacity="0.6"/>
          <ellipse cx="174" cy="86" rx="5" ry="4" fill="url(#ragdollFur)" opacity="0.6"/>

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
              <ellipse cx="70" cy="90" rx="18" ry="20" fill="white" stroke="#E8E0D8" strokeWidth="1" />
              <ellipse cx="130" cy="90" rx="18" ry="20" fill="white" stroke="#E8E0D8" strokeWidth="1" />

              {eyeExpression === "worried" ? (
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
              d={eyeExpression === "worried" || eyeExpression === "sad"
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

          {hasItem("bowtie") && (
            <motion.g
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "100px", originY: "148px" }}
            >
              <path d="M75 145 Q65 140 60 148 Q65 156 75 151 L75 145" fill="#FF69B4" />
              <path d="M125 145 Q135 140 140 148 Q135 156 125 151 L125 145" fill="#FF69B4" />
              <circle cx="100" cy="148" r="6" fill="#FF1493" />
              <circle cx="100" cy="148" r="3" fill="#FFB6C1" />
            </motion.g>
          )}

          {hasItem("crown") && (
            <motion.g
              animate={{ y: [0, -2, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M65 52 L75 35 L90 45 L100 25 L110 45 L125 35 L135 52 L130 55 L70 55 Z" 
                fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
              <circle cx="75" cy="42" r="3" fill="#FF0000" />
              <circle cx="100" cy="32" r="4" fill="#00BFFF" />
              <circle cx="125" cy="42" r="3" fill="#32CD32" />
              <motion.ellipse
                cx="100"
                cy="32"
                rx="5"
                ry="5"
                fill="white"
                opacity="0.5"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.g>
          )}

          {hasItem("glasses") && (
            <motion.g
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <circle cx="70" cy="90" r="22" fill="none" stroke="#1E1E1E" strokeWidth="3" />
              <circle cx="130" cy="90" r="22" fill="none" stroke="#1E1E1E" strokeWidth="3" />
              <line x1="92" y1="90" x2="108" y2="90" stroke="#1E1E1E" strokeWidth="3" />
              <line x1="48" y1="88" x2="35" y2="82" stroke="#1E1E1E" strokeWidth="2" />
              <line x1="152" y1="88" x2="165" y2="82" stroke="#1E1E1E" strokeWidth="2" />
              <ellipse cx="70" cy="90" rx="18" ry="16" fill="#87CEEB" opacity="0.3" />
              <ellipse cx="130" cy="90" rx="18" ry="16" fill="#87CEEB" opacity="0.3" />
            </motion.g>
          )}

          {hasItem("hat") && (
            <motion.g
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ originX: "100px", originY: "60px" }}
            >
              <ellipse cx="100" cy="60" rx="45" ry="12" fill="#9333EA" />
              <path d="M70 60 Q75 15 100 10 Q125 15 130 60" fill="#9333EA" />
              <ellipse cx="100" cy="60" rx="35" ry="8" fill="#A855F7" />
              <motion.circle
                cx="100"
                cy="10"
                r="8"
                fill="#FFD700"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.g>
          )}

          {hasItem("scarf") && (
            <motion.g
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M50 140 Q60 138 100 140 Q140 138 150 140 Q148 150 100 148 Q52 150 50 140" 
                fill="#E53E3E" stroke="#C53030" strokeWidth="1" />
              <motion.path
                d="M145 145 Q155 155 150 175 Q145 185 155 195"
                fill="none"
                stroke="#E53E3E"
                strokeWidth="8"
                strokeLinecap="round"
                animate={{ x: [-2, 3, -2], y: [0, 2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <line x1="60" y1="142" x2="140" y2="142" stroke="#FEB2B2" strokeWidth="3" strokeDasharray="8 4" />
            </motion.g>
          )}

          {hasItem("collar") && (
            <motion.g
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="100" cy="145" rx="35" ry="8" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2" />
              <motion.circle
                cx="100"
                cy="152"
                r="6"
                fill="#FFD700"
                stroke="#DAA520"
                strokeWidth="1"
                animate={{ 
                  y: [0, 2, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <circle cx="100" cy="152" r="2" fill="#FFF" opacity="0.5" />
            </motion.g>
          )}

          {hasItem("cape") && (
            <motion.g
              animate={{ 
                scaleX: [1, 1.05, 1],
                x: [-2, 2, -2]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path 
                d="M55 130 Q50 140 45 180 Q70 175 100 180 Q130 175 155 180 Q150 140 145 130"
                fill="#DC2626"
                stroke="#B91C1C"
                strokeWidth="2"
              />
              <path 
                d="M55 130 Q50 140 47 165 Q65 160 100 165 Q135 160 153 165 Q150 140 145 130"
                fill="#EF4444"
                opacity="0.5"
              />
              <motion.path
                d="M100 130 L100 175"
                stroke="#FFD700"
                strokeWidth="3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.g>
          )}

          {hasItem("sweater") && (
            <motion.g
              animate={{ y: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ellipse cx="100" cy="150" rx="50" ry="35" fill="#22C55E" />
              <ellipse cx="100" cy="150" rx="45" ry="30" fill="#16A34A" />
              <path d="M55 145 Q60 135 100 138 Q140 135 145 145" fill="#22C55E" stroke="#15803D" strokeWidth="2" />
              <line x1="65" y1="155" x2="135" y2="155" stroke="#15803D" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="68" y1="165" x2="132" y2="165" stroke="#15803D" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="72" y1="175" x2="128" y2="175" stroke="#15803D" strokeWidth="2" strokeDasharray="6 3" />
            </motion.g>
          )}
        </svg>
      </motion.div>
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
        <svg viewBox="0 0 200 60" className="w-64 h-20 -mt-4">
          <defs>
            <linearGradient id="pillowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="50%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
            <filter id="pillowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2"/>
            </filter>
            <filter id="cloudBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1"/>
            </filter>
          </defs>
          
          <ellipse cx="100" cy="35" rx="88" ry="22" fill="url(#pillowGrad)" filter="url(#pillowShadow)" />
          
          <ellipse cx="25" cy="32" rx="22" ry="16" fill="white" opacity="0.9" filter="url(#cloudBlur)" />
          <ellipse cx="12" cy="35" rx="14" ry="10" fill="white" opacity="0.8" />
          <ellipse cx="35" cy="28" rx="12" ry="9" fill="white" opacity="0.7" />
          
          <ellipse cx="175" cy="32" rx="22" ry="16" fill="white" opacity="0.9" filter="url(#cloudBlur)" />
          <ellipse cx="188" cy="35" rx="14" ry="10" fill="white" opacity="0.8" />
          <ellipse cx="165" cy="28" rx="12" ry="9" fill="white" opacity="0.7" />
          
          <ellipse cx="55" cy="42" rx="10" ry="7" fill="white" opacity="0.6" />
          <ellipse cx="145" cy="42" rx="10" ry="7" fill="white" opacity="0.6" />
          
          <ellipse cx="100" cy="30" rx="50" ry="10" fill="#FCA5A5" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
