export default function LogoMark() {
  return (
    <div className="relative flex min-w-0 items-center gap-3">
      <div className="hero-ring relative grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-500 text-sm font-bold text-white sm:size-11">
        TE
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold tracking-tight sm:text-base">Tibexa</p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">منصة الاستشارات الطبية</p>
      </div>
    </div>
  );
}
