import clsx from "clsx";
import React from "react";

export const Header = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLElement>) => {
  return <header className={clsx("p-4 text-white shadow-md", className)} {...props}>
    {children}
  </header>
}
