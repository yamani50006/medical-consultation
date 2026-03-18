export const formatCurrency = (value: number) => `${new Intl.NumberFormat("ar-SA").format(value)} ر.س`;

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

