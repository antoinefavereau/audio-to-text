import { ReactNode, ButtonHTMLAttributes } from "react";

export const baseButtonClasses =
  "flex gap-4 items-center duration-100 px-8 py-3 rounded-xl font-medium cursor-pointer text-white";

export const variantButtonClasses = {
  primary: "p-4 bg-transparent hover:bg-transparentLight border-2 border-light",
  secondary: "bg-secondary hover:bg-secondaryLight",
  tertiary: "bg-primary hover:bg-primaryLight",
  transparent: "px-0 py-0 bg-none hover:underline",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "transparent";
}

const Button = ({ children, variant = "primary", ...props }: ButtonProps) => {
  return (
    <button
      className={`${variantButtonClasses[variant]} ${baseButtonClasses}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
