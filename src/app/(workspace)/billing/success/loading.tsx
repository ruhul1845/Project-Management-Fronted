export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-4 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
      <div className="skeleton h-64" />
    </div>
  );
}
