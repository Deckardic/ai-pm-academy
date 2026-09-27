import { routes } from "@/shared/config";
import { ButtonLink, Skeleton } from "@/shared/ui";
import { getCurrentUser } from "@/entities/user/index.server";
import { UserMenu } from "@/features/authentication";

/** Reads the session: rendered behind <Suspense> so the header stays in the static shell. */
export async function UserArea() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href={routes.signIn()} variant="ghost" size="sm">
          Войти
        </ButtonLink>
        <ButtonLink href={routes.signUp()} size="sm" className="hidden sm:inline-flex">
          Начать бесплатно
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <ButtonLink
        href={routes.dashboard()}
        variant="secondary"
        size="sm"
        className="hidden sm:inline-flex"
      >
        Кабинет
      </ButtonLink>
      <UserMenu name={user.name} email={user.email} image={user.image} />
    </div>
  );
}

export function UserAreaFallback() {
  return <Skeleton className="h-8 w-36 rounded-md" />;
}
