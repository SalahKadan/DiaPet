import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  label: string;
  value: number; // 0-100 normally, but blood sugar can be higher
  max?: number;
  icon?: React.ReactNode;
  colorClass?: string;
  type?: "normal" | "bloodSugar";
  className?: string;
}

export function StatusIndicator({
  label,
  value,
  max = 100,
  icon,
  colorClass = "bg-primary",
  type = "normal",
  className
}: StatusIndicatorProps) {
  
  // Calculate percentage for width
  let percentage = Math.min((value / max) * 100, 100);
  
  // Custom logic for blood sugar color
  let barColor = colorClass;
  if (type === "bloodSugar") {
    // 70-140 is good (green), <70 (red), >180 (red), 140-180 (yellow)
    if (value < 70 || value > 180) barColor = "bg-destructive";
    else if (value > 140) barColor = "bg-yellow-400";
    else barColor = "bg-green-500";
  }

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="flex justify-between items-center text-sm font-bold text-gray-600 px-1">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span>{value} {type === 'bloodSugar' ? 'mg/dL' : '%'}</span>
      </div>
      <div className="stat-bar-container relative h-5">
        <motion.div
          className={cn("h-full rounded-full shadow-sm", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
        {/* Subtle shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-full pointer-events-none" />
      </div>
    </div>
  );
}
