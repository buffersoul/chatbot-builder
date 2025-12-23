import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow-sm [a&]:hover:bg-primary/90 [a&]:hover:shadow-md",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground shadow-sm [a&]:hover:bg-secondary/90",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow-sm [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20",
                outline:
                    "border-2 text-foreground [a&]:hover:bg-muted [a&]:hover:border-primary/50",
                success:
                    "border-transparent bg-success text-success-foreground shadow-sm [a&]:hover:bg-success/90",
                warning:
                    "border-transparent bg-warning text-warning-foreground shadow-sm [a&]:hover:bg-warning/90",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Badge({
    className,
    variant,
    asChild = false,
    ...props
}) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
