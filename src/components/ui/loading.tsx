import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
    fullScreen?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
};

export function Loading({ fullScreen = false, className, size = "md" }: LoadingProps) {
    const containerClasses = cn(
        "flex items-center justify-center",
        fullScreen && "h-screen",
        className
    );

    return (
        <div className={containerClasses}>
            <Loader2 className={cn(sizeMap[size], "animate-spin")} />
        </div>
    );
} 