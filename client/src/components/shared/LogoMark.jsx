export default function LogoMark() {
  return (
    <div className="relative flex items-center gap-3">
      <div className="hero-ring relative grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 text-sm font-bold text-white">
        MC
      </div>
      <div>
        <p className="font-display text-base font-semibold tracking-tight">ميد كونسلت</p>
        <p className="text-xs text-muted-foreground">منصة الاستشارات الطبية</p>
      </div>
    </div>
  );
}
