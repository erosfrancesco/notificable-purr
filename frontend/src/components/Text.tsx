import React from "react"
import clsx from "clsx"

export const Text = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLSpanElement>) => {
    return <span className={clsx("text-lg mb-4 text-gray-900 dark:text-white", className)} {...props}>
        {children}
    </span>
}

export const TextHeading = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLHeadingElement>) => {
    return <h1 className={clsx("text-2xl font-semibold mb-4 text-gray-900 dark:text-white", className)} {...props}>
        {children}
    </h1>
}

export const TextSubheading = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLHeadingElement>) => {
    return <h2 className={clsx("text-xl font-medium mb-3 text-gray-800 dark:text-gray-100", className)} {...props}>
        {children}
    </h2>
}

export const TextSmall = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLSpanElement>) => {
    return <span className={clsx("text-sm mb-2 text-gray-700 dark:text-gray-300", className)} {...props}>
        {children}
    </span>
}

export const TextError = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLSpanElement>) => {
    return <span className={clsx("text-sm text-red-600 dark:text-red-400 mb-2", className)} {...props}>
        {children}
    </span>
}

export const TextSuccess = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLSpanElement>) => {
    return <span className={clsx("text-sm text-green-600 dark:text-green-400 mb-2", className)} {...props}>
        {children}
    </span>
}