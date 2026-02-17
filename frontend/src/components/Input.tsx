import React from "react"
import clsx from "clsx"

export const Input = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLInputElement>) => {
    return <input className={clsx(
        "w-full max-w-sm p-2 rounded border border-gray-300 bg-white text-gray-900",
        "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
        "focus:border-blue-500 focus:outline-none",
        "transition-colors duration-300",
        className
    )} {...props}>
        {children}
    </input>
}
