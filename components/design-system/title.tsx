import { cn } from "../../lib/cn";

export const Title = ({
  children,
  size = "md",
  as: Tag = "p",
  className,
}: {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
}) => {
  return (
    <Tag
      className={cn(
        "font-normal leading-[1.3]",
        {
          "!text-[14px]": size === "xs",
          "!text-[16px]": size === "sm",
          "!text-18": size === "md",
          "!text-[20px]": size === "lg",
          "!text-[24px] md:!text-[28px] leading-none": size === "xl",
          "!text-[32px] md:!text-[40px] leading-none": size === "2xl",
          "!text-[32px] md:!text-[40px] lg:!text-[48px] leading-none": size === "3xl",
        },
        className
      )}
    >
      {children}
    </Tag>
  );
};
