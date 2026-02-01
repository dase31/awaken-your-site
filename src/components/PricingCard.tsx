import { Check } from "lucide-react";

interface PricingCardProps {
  trialDays: number;
  plan: string;
  price: string;
  period: string;
  selected: boolean;
  bestValue?: boolean;
  onSelect: () => void;
}

const PricingCard = ({
  trialDays,
  plan,
  price,
  period,
  selected,
  bestValue,
  onSelect,
}: PricingCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 ${
        selected
          ? "bg-card border-2 border-primary shadow-xl"
          : "bg-sky-mid/40 hover:bg-card/90 border-2 border-transparent"
      }`}
    >
      {bestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
          Best value
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-card-foreground/70 text-sm font-medium">
            {trialDays} Days Free
          </p>
          <h3 className="text-card-foreground text-2xl font-bold mt-1">{plan}</h3>
          <p className="text-card-foreground/60 text-sm mt-1">
            {price}/{period}
          </p>
        </div>
        
        <div
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-emerald-500 border-emerald-500"
              : "border-card-foreground/30"
          }`}
        >
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
