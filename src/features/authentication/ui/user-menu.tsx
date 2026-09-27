"use client";

import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { GraduationCap, LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "@/shared/auth";
import { routes } from "@/shared/config";
import { UserAvatar } from "@/entities/user";

const itemClass =
  "flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-sm text-fg outline-none select-none data-highlighted:bg-bg-subtle [&_svg]:size-4 [&_svg]:text-fg-subtle";

export function UserMenu({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const router = useRouter();
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Меню профиля"
        className="pressable cursor-pointer rounded-full outline-offset-2 data-popup-open:ring-2 data-popup-open:ring-accent-ring"
      >
        <UserAvatar name={name} image={image} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50 outline-none">
          {/* Scales out of the avatar that opened it. */}
          <Menu.Popup className="w-60 origin-(--transform-origin) rounded-xl bg-surface-raised p-1.5 shadow-popover transition-[transform,opacity] duration-(--duration-popover) ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="px-2.5 pt-1.5 pb-2.5">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-fg-muted">{email}</p>
            </div>
            <Menu.Separator className="mx-1 mb-1 h-px bg-line" />
            <Menu.LinkItem href={routes.dashboard()} className={itemClass}>
              <LayoutDashboard aria-hidden /> Личный кабинет
            </Menu.LinkItem>
            <Menu.LinkItem href={routes.catalog()} className={itemClass}>
              <GraduationCap aria-hidden /> Программа курса
            </Menu.LinkItem>
            <Menu.Separator className="mx-1 my-1 h-px bg-line" />
            <Menu.Item
              className={itemClass}
              onClick={async () => {
                await signOut();
                router.push(routes.home());
                router.refresh();
              }}
            >
              <LogOut aria-hidden /> Выйти
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
