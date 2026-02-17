import clsx from "clsx"

export const Page = ({ children, className, Header, ...props }: React.PropsWithChildren & React.HTMLProps<HTMLDivElement> & { Header: React.ReactElement }) => {
    return <div className={clsx(
        "text-center min-h-screen",
        "bg-gradient-to-br from-purple-500 to-blue-500 dark:bg-gradient-to-br dark:from-slate-800 dark:to-blue-400",
        "text-gray-900 dark:text-white",
        className
    )} {...props}>

        {Header}

        <main className="max-w-3xl mx-auto p-4">
            {children}
        </main>
    </div>
}

