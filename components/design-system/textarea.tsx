import * as React from "react";
import { cn } from "../../lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full rounded resize-none border bg-transparent p-6 text-[16px] text-black placeholder:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:border-black",
          className,
          {
            "border-red-200": error,
            "border-gray-300": !error,
          }
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
