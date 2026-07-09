import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;

  /** enable apple liquid glass style */
  glass?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    {
      className,
      activeClassName,
      pendingClassName,
      glass = false,
      to,
      ...props
    },
    ref,
  ) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            "relative transition-all duration-300",

            glass &&
              "px-4 py-2 rounded-full backdrop-blur-md bg-white/[0.05] border border-white/[0.15] shadow-[0_8px_30px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.05)_40%,transparent)] before:opacity-60 before:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)] after:opacity-30 after:pointer-events-none",

            className,
            isActive && activeClassName,
            isPending && pendingClassName,
          )
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
