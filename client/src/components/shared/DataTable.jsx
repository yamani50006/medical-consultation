import { cn } from "../../utils/cn";

export default function DataTable({ columns = [], rows = [], emptyLabel = "لا توجد بيانات متاحة." }) {
  if (rows.length === 0) {
    return <div className="rounded-3xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-border/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-secondary/70">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 text-right font-semibold", column.className)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card/50">
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="transition-colors duration-300 hover:bg-secondary/40">
                {columns.map((column) => (
                  <td key={`${row.id || rowIndex}-${column.key}`} className={cn("px-4 py-3 align-top", column.cellClassName)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
