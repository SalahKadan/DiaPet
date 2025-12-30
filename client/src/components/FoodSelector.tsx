import { useFoods } from "@/hooks/use-pets";
import { Loader2, Apple, Cookie, Pizza, Fish } from "lucide-react";
import { motion } from "framer-motion";

interface FoodSelectorProps {
  onSelect: (foodId: number) => void;
  disabled?: boolean;
}

const foodIcons: Record<string, React.ReactNode> = {
  apple: <Apple className="w-8 h-8 text-red-500" />,
  cookie: <Cookie className="w-8 h-8 text-amber-700" />,
  pizza: <Pizza className="w-8 h-8 text-orange-500" />,
  fish: <Fish className="w-8 h-8 text-blue-500" />,
};

export function FoodSelector({ onSelect, disabled }: FoodSelectorProps) {
  const { data: foods, isLoading } = useFoods();

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2">
      {foods?.map((food) => (
        <motion.button
          key={food.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
          onClick={() => onSelect(food.id)}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-md hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="bg-slate-50 p-3 rounded-full mb-2">
            {/* Fallback to apple if icon not mapped */}
            {foodIcons[food.image?.toLowerCase() || 'apple'] || <Apple className="w-8 h-8 text-green-500" />}
          </div>
          <span className="font-bold text-gray-700">{food.name}</span>
          <div className="flex gap-2 text-xs mt-1">
            <span className="text-orange-500 font-semibold">{food.carbImpact}g Carbs</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
