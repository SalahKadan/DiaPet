import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Syringe, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InsulinControlProps {
  onAdminister: (units: number) => void;
  isPending: boolean;
  currentBloodSugar: number;
}

export function InsulinControl({ onAdminister, isPending, currentBloodSugar }: InsulinControlProps) {
  const [units, setUnits] = useState(1);
  
  // Simple calculation guidance for kids (not medical advice!)
  const recommendedDose = currentBloodSugar > 200 ? 5 : currentBloodSugar > 150 ? 3 : 1;

  return (
    <div className="p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold">
          <Syringe className="w-5 h-5" />
          <span>Insulin Dosage</span>
        </div>
        <div className="text-xs bg-white px-2 py-1 rounded-full border border-blue-100 text-blue-400">
          Recommending: {recommendedDose}u
        </div>
      </div>
      
      <div className="flex items-end justify-center h-24 mb-6 relative">
        <motion.div 
          key={units}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-display text-primary font-bold z-10"
        >
          {units}
          <span className="text-lg text-gray-400 ml-1 font-sans font-normal">units</span>
        </motion.div>
        
        {/* Visual syringe liquid level representation could go here */}
      </div>

      <Slider
        value={[units]}
        onValueChange={(vals) => setUnits(vals[0])}
        max={10}
        step={0.5}
        className="mb-6 cursor-pointer"
      />

      <Button 
        onClick={() => onAdminister(units)} 
        disabled={isPending}
        className="w-full h-12 text-lg rounded-xl bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-200"
      >
        {isPending ? "Administering..." : "Give Insulin"}
      </Button>
    </div>
  );
}
