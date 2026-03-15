import { BrainCircuit, LoaderCircle, Sparkles } from "lucide-react";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";

const quickSymptoms = [
  "صداع شديد",
  "حرارة وتعب",
  "ألم أسنان",
  "دوخة",
  "ألم صدر",
  "ألم بطن"
];

export default function SymptomAnalyzerPanel({
  symptomsText,
  onSymptomsTextChange,
  onAnalyze,
  loading,
  analysis,
  onUseSpecialty
}) {
  return (
    <div className="space-y-4">
      <Textarea
        label="وصف الأعراض اختياريًا"
        value={symptomsText}
        onChange={(event) => onSymptomsTextChange(event.target.value)}
        placeholder="اكتب الأعراض التي يشعر بها المريض حتى نقترح التخصص الأنسب"
        className="min-h-28"
      />

      <div className="flex flex-wrap gap-2">
        {quickSymptoms.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              onSymptomsTextChange(symptomsText ? `${symptomsText}، ${item}` : item)
            }
            className="rounded-full border border-border/70 bg-secondary/50 px-3 py-2 text-xs font-medium transition-colors duration-300 hover:border-primary/20 hover:bg-primary/5"
          >
            {item}
          </button>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={onAnalyze} disabled={loading || !symptomsText.trim()}>
        {loading ? <LoaderCircle className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
        تحليل الأعراض
      </Button>

      {analysis?.suggestedSpecialties?.length ? (
        <div className="rounded-[24px] border border-primary/15 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles className="size-4" />
            التخصصات المقترحة
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {analysis.suggestedSpecialties.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onUseSpecialty(item.name)}
                className="rounded-full border border-primary/20 bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-primary/10"
              >
                {item.name} - {item.confidence}%
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
