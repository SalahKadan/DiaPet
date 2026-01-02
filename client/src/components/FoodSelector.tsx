import { useFoods } from "@/hooks/use-pets";
import { Loader2, Apple, Cookie, Pizza, Fish, Salad, GlassWater, Droplets, Candy, Sandwich, Carrot } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface FoodSelectorProps {
  onSelect: (foodId: number) => void;
  disabled?: boolean;
}

const foodIcons: Record<string, React.ReactNode> = {
  apple: <Apple className="w-7 h-7 text-red-500" />,
  cookie: <Cookie className="w-7 h-7 text-amber-600" />,
  pizza: <Pizza className="w-7 h-7 text-orange-500" />,
  fish: <Fish className="w-7 h-7 text-blue-500" />,
  salad: <Salad className="w-7 h-7 text-green-500" />,
  soda: <GlassWater className="w-7 h-7 text-amber-500" />,
  water: <Droplets className="w-7 h-7 text-cyan-500" />,
  candy: <Candy className="w-7 h-7 text-pink-500" />,
  sandwich: <Sandwich className="w-7 h-7 text-yellow-600" />,
  carrot: <Carrot className="w-7 h-7 text-orange-400" />,
};

export function FoodSelector({ onSelect, disabled }: FoodSelectorProps) {
  const { data: foods, isLoading } = useFoods();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      {foods?.map((food) => {
        const isHealthy = food.healthValue > 0;
        const isHighCarb = food.carbImpact > 30;
        
        return (
          <motion.button
            key={food.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={disabled}
            onClick={() => onSelect(food.id)}
            data-testid={`button-food-${food.id}`}
            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
              isHealthy 
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
            } hover:shadow-md disabled:opacity-50`}
          >
            <div className={`p-3 rounded-full mb-2 ${
              isHealthy 
                ? "bg-green-100 dark:bg-green-800/30" 
                : "bg-orange-100 dark:bg-orange-800/30"
            }`}>
              {foodIcons[food.image?.toLowerCase() || 'apple'] || <Apple className="w-7 h-7 text-green-500" />}
            </div>
            
            <span className="font-bold text-sm text-foreground mb-1">{food.name}</span>
            
            <div className="flex flex-col items-center gap-0.5 text-xs">
              <span className={`font-medium ${isHighCarb ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                {food.carbImpact}g {t.dashboard?.carbs || "Carbs"}
              </span>
              <span className={`font-medium ${
                food.healthValue > 0 
                  ? "text-green-600 dark:text-green-400" 
                  : food.healthValue < 0 
                    ? "text-red-500 dark:text-red-400" 
                    : "text-muted-foreground"
              }`}>
                {food.healthValue > 0 ? "+" : ""}{food.healthValue} {t.dashboard?.healthPts || "Health"}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
