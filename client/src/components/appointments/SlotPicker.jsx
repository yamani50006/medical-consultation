import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";

export default function SlotPicker({ maxSlots, bookedSlotNumbers, selectedSlot, onSelect }) {
  const slots = Array.from({ length: maxSlots }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="size-4" />
        <span>اختر خانة الحجز المتاحة:</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {slots.map((slot) => {
          const isBooked = bookedSlotNumbers.includes(slot);
          const isSelected = selectedSlot === slot;

          return (
            <motion.button
              key={slot}
              whileHover={!isBooked ? { scale: 1.05 } : {}}
              whileTap={!isBooked ? { scale: 0.95 } : {}}
              onClick={() => !isBooked && onSelect(slot)}
              disabled={isBooked}
              className={`
                relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all
                ${
                  isBooked 
                  ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed opacity-60" 
                  : isSelected
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 cursor-pointer shadow-sm hover:shadow-md"
                }
              `}
            >
              <span className={`text-lg font-bold ${isBooked ? "line-through" : ""}`}>
                خانة {slot}
              </span>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-white shadow-lg"
                >
                  <Check className="size-3.5" />
                </motion.div>
              )}

              <span className="text-[10px] font-medium tracking-wider opacity-60 uppercase">
                {isBooked ? "محجوزة" : "متاحة"}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
