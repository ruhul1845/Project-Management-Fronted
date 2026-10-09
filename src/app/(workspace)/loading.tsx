export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 md:px-8">
      <div className="skeleton h-8 w-52" />
      <div className="skeleton h-4 w-80 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-30" />
        ))}
      </div>
      <div className="skeleton h-72" />
    </div>
  );
}
