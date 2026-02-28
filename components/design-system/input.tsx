import * as React from "react";
import { cn } from "../../lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        className={cn(
          "h-10 text-[16px] placeholder:!text-14 sm:placeholder:!text-15 sm:!text-15 w-full rounded-lg bg-gray-100 border py-2 pl-3 md:pl-6 pr-1 text-gray-900 placeholder:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus:outline-none focus:border-gray-300 transition-all duration-300",
          className,
          {
            "border-red-200 focus:border-gray-200": error,
            "border-gray-200": !error,
          }
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
