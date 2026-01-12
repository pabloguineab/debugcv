import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "flex w-full rounded-md shadow-sm",
                // Child styles to merge borders
                "[&>:first-child]:rounded-r-none",
                "[&>:last-child]:rounded-l-none",
                "[&>:not(:first-child):not(:last-child)]:rounded-none",
                // Prevent double borders
                "[&>:not(:first-child)]:-ml-px",
                // Bring focused element to front
                "[&>*]:focus:relative [&>*]:focus:z-10",
                className
            )}
            {...props}
        />
    )
})
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
