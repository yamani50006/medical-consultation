export default function InfoGrid({ items = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[22px] border border-border/60 bg-secondary/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
          <p className="mt-3 text-sm leading-7 text-foreground">{item.value || "-"}</p>
        </div>
      ))}
    </div>
  );
}
