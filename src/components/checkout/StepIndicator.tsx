
import React from "react";
import { 
  ShoppingCart, 
  Clock, 
  User,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const steps = [
    { icon: ShoppingCart, label: "Servicios" },
    { icon: Clock, label: "Fecha y Hora" },
    { icon: User, label: "Datos" },
  ];

  return (
    <div className="flex items-center justify-between w-full mb-8 px-2">
      {steps.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <div className={cn(
                "flex-1 h-1 mx-2", 
                isComplete ? "bg-primary" : "bg-gray-200"
              )} />
            )}
            
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center", 
                isActive ? "bg-primary text-white" : 
                isComplete ? "bg-green-500 text-white" : 
                "bg-gray-200 text-gray-400"
              )}>
                {isComplete ? <Check size={18} /> : <StepIcon size={18} />}
              </div>
              <span className={cn(
                "text-xs mt-1 max-w-[60px] text-center", 
                isActive ? "text-primary font-medium" : 
                isComplete ? "text-green-500" : 
                "text-gray-400"
              )}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
