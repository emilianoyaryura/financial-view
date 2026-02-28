import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import Link from "next/link";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "active:scale-95 inline-flex items-center gap-2 border justify-center transition-colors focus:outline-none disabled:cursor-not-allowed font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-primary !text-white md:hover:opacity-80 border-primary md:hover:border-primary focus:ring-1 focus:ring-primary focus:ring-offset-1 text-white disabled:opacity-80",
        destructive:
          "bg-red-500 border-red-500 text-white md:hover:bg-red-600 md:hover:border-red-600 focus:ring-1 focus:ring-red-600 focus:ring-offset-1",
        outline:
          "bg-transparent border-gray-400 hover:bg-gray-100 text-text focus:ring-1 focus:ring-gray-1000 focus:ring-offset-1",
        subtle:
          "bg-gray-100 text-text md:hover:bg-gray-200 border-gray-200 focus:ring-1 focus:ring-gray-200 focus:ring-offset-1",
        ghost:
          "bg-transparent border-transparent md:hover:border-gray-200 md:hover:bg-gray-100 data-[state=open]:bg-transparent ",
        link: "bg-transparent border-transparent underline-offset-3 md:hover:text-gray-1000 text-gray-900 md:hover:bg-transparent",
        selected:
          "bg-blue-100 border-blue-200 text-gray-900 md:hover:border-blue-300 focus:ring-1 focus:ring-gray-800 focus:ring-offset-1",
      },
      size: {
        default: "py-2 px-4 text-xs rounded-md h-[36px]",
        xs: "py-[2px] px-2 text-xs rounded-md",
        sm: "leading-none text-xs px-4 rounded-md h-[32px]",
        lg: "py-2 lg:py-3 px-6 lg:px-8 rounded-md text-sm h-10",
        icon: "w-10 h-10 p-0 rounded-md flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }
export interface ButtonLinkProps
  extends React.ButtonHTMLAttributes<HTMLAnchorElement>,
  VariantProps<typeof buttonVariants> {
  href: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, href, variant, size, ...props }, ref) => {
    return (
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
ButtonLink.displayName = "ButtonLink";

export { Button, buttonVariants, ButtonLink };
