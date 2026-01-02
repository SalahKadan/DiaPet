import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Minus, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface InsulinControlProps {
  onAdminister: (units: number) => void;
  isPending: boolean;
  currentBloodSugar: number;
}

export function InsulinControl({ onAdminister, isPending, currentBloodSugar }: InsulinControlProps) {
  const [units, setUnits] = useState(1);
  
  const targetBloodSugar = 120;
  const isBloodSugarHigh = currentBloodSugar > 180;
  const isBloodSugarVeryHigh = currentBloodSugar > 250;
  const isBloodSugarLow = currentBloodSugar < 100;
  
  const excessSugar = currentBloodSugar - targetBloodSugar;
  const calculatedDose = Math.ceil(excessSugar / 10);
  const recommendedDose = Math.max(1, Math.min(5, calculatedDose));
  
  const getStatusMessage = () => {
    if (isBloodSugarLow) {
      return { text: "Blood sugar is low! Maybe eat instead?", color: "text-orange-600", bg: "bg-orange-100", icon: AlertTriangle };
    }
    if (isBloodSugarVeryHigh) {
      return { text: "Blood sugar is very high! Insulin will help.", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle };
    }
    if (isBloodSugarHigh) {
      return { text: "Blood sugar is a bit high. A small dose should help!", color: "text-blue-600", bg: "bg-blue-100", icon: Droplets };
    }
    return { text: "Blood sugar is in a good range!", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
  };

  const status = getStatusMessage();
  const StatusIcon = status.icon;

  const increment = () => setUnits(prev => Math.min(prev + 1, 5));
  const decrement = () => setUnits(prev => Math.max(prev - 1, 1));

  const syringeFillPercent = (units / 5) * 100;

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl ${status.bg} flex items-start gap-3`}>
        <StatusIcon className={`w-5 h-5 ${status.color} shrink-0 mt-0.5`} />
        <div>
          <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Current: <span className="font-bold">{currentBloodSugar} mg/dL</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="relative w-16 h-40">
          <svg viewBox="0 0 60 150" className="w-full h-full">
            <rect x="20" y="10" width="20" height="120" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2" />
            
            <motion.rect 
              x="22" 
              y="12" 
              width="16" 
              rx="2"
              fill="url(#insulinGradient)"
              initial={false}
              animate={{ 
                height: syringeFillPercent * 1.16,
                y: 128 - (syringeFillPercent * 1.16)
              }}
              transition={{ type: "spring", damping: 15 }}
            />
            
            <defs>
              <linearGradient id="insulinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            
            {[1, 2, 3, 4, 5].map((mark) => (
              <g key={mark}>
                <line 
                  x1="42" 
                  y1={128 - (mark * 23.2)} 
                  x2="48" 
                  y2={128 - (mark * 23.2)} 
                  stroke="#9ca3af" 
                  strokeWidth="1.5" 
                />
                <text 
                  x="52" 
                  y={132 - (mark * 23.2)} 
                  fontSize="10" 
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {mark}
                </text>
              </g>
            ))}
            
            <rect x="25" y="0" width="10" height="15" rx="2" fill="#9ca3af" />
            <rect x="28" y="-5" width="4" height="10" rx="1" fill="#6b7280" />
            
            <ellipse cx="30" cy="135" rx="12" ry="6" fill="#d1d5db" />
            <path d="M28 140 L30 150 L32 140" fill="#9ca3af" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={increment}
            disabled={units >= 5 || isPending}
            className="w-14 h-14 rounded-2xl text-2xl font-bold border-2"
            data-testid="button-insulin-increase"
          >
            <Plus className="w-6 h-6" />
          </Button>
          
          <motion.div 
            key={units}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-primary">{units}</div>
            <div className="text-sm text-muted-foreground">units</div>
          </motion.div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={decrement}
            disabled={units <= 1 || isPending}
            className="w-14 h-14 rounded-2xl text-2xl font-bold border-2"
            data-testid="button-insulin-decrease"
          >
            <Minus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {isBloodSugarHigh && (
        <div className="text-center text-sm text-muted-foreground">
          Suggested dose: <span className="font-bold text-primary">{recommendedDose} units</span>
        </div>
      )}

      <Button 
        onClick={() => onAdminister(units)} 
        disabled={isPending}
        className="w-full h-14 text-lg rounded-2xl bg-blue-500 hover:bg-blue-600 shadow-lg"
        data-testid="button-give-insulin"
      >
        <Droplets className="w-5 h-5 mr-2" />
        {isPending ? "Giving Insulin..." : "Give Insulin"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Each unit lowers blood sugar by about 10 mg/dL
      </p>
    </div>
  );
}
