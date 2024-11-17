import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button = ({ children, ...props }: ButtonProps) => {
  return <button className="bg-transparent hover:bg-transparentLight duration-100 border-2 border-light p-4 rounded-3xl font-bold" {...props}>{children}</button>;
};

export default Button;
