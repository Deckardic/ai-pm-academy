import { Container } from "./container";
import { Skeleton } from "./skeleton";

/** Neutral fallback for param-dependent pages (the App Shell for unknown URLs). */
export function PageSkeleton({ size = "default" }: { size?: "narrow" | "default" | "wide" }) {
  return (
    <Container size={size} className="flex flex-col gap-4 py-16">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-11 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-4 h-56 w-full rounded-xl" />
    </Container>
  );
}
