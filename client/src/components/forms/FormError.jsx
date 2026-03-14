export default function FormError({ message }) {
  if (!message) return null;
  return (
    <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  );
}
