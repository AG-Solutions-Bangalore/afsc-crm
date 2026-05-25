const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-indigo-50 bg-white shadow-sm">
    <div className="skeleton h-44 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  </div>
);

export default SkeletonCard;
