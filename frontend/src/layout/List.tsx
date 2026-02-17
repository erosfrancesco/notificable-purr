import clsx from "clsx";
import React from "react";

export const ListItem = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLLIElement>) => {
    return <li className={clsx("text-gray-700 text-lg mb-2 dark:text-gray-200", className)} {...props}>
        {children}
    </li>
}

export const List = ({ children, className, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLUListElement>) => {
    return <ul className={clsx("text-start", className)} {...props}>
        {children}
    </ul>
}
