import React from "react";

export const Label = ({
  children,
  ...props
}: React.ComponentPropsWithRef<"label">) => {
  return (
    <label className="font-medium text-[15px]" {...props}>
      {children}
    </label>
  );
};
