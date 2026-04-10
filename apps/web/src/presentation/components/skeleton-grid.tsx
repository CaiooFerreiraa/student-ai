type SkeletonGridProps = {
  items?: number;
};

export function SkeletonGrid({ items = 4 }: SkeletonGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: items }).map((_, index: number) => (
        <div className="ui-skeleton h-48" key={index} />
      ))}
    </div>
  );
}
