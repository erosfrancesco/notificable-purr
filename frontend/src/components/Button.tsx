import React from "react"
import clsx from "clsx"

export const Button = ({ children, type, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLButtonElement>) => {
    return <button className={clsx(
        "px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "transition-colors duration-300",
        className
    )} {...props} type={type as "submit" | "reset" | "button" | undefined}>
        {children}
    </button>
}
