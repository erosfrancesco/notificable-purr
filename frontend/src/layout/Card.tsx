import clsx from "clsx";
import React from "react";

export const Card = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLElement>) => {
    return <section className={clsx(
        "bg-white dark:bg-gray-900",
        "rounded-lg p-8 mb-6 shadow-lg",
        "text-gray-800 dark:text-gray-100 animate-fadeIn",
        className
    )} {...props}>
        {children}
    </section>
}