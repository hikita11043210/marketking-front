import { toast } from "@/hooks/use-toast";

type ToastMessage = {
    title?: string;
    description: string;
}

export const showToast = {
    success: ({ title = "成功", description }: ToastMessage) => {
        toast({
            title,
            description,
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
        });
    },
    error: ({ title = "エラー", description }: ToastMessage) => {
        toast({
            title,
            description,
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
        });
    },
    warning: ({ title = "警告", description }: ToastMessage) => {
        toast({
            title,
            description,
            variant: "default",
            className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        });
    },
}; 