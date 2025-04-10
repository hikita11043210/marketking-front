import { toast } from "sonner";

type ToastMessage = {
    title?: string;
    description: string;
}

export const showToast = {
    success: ({ title, description }: ToastMessage) => {
        toast.success(description, {
            ...(title && { title }),
        } as any);
    },
    error: ({ title, description }: ToastMessage) => {
        toast.error(description, {
            ...(title && { title }),
        } as any);
    },
    warning: ({ title, description }: ToastMessage) => {
        toast.warning(description, {
            ...(title && { title }),
        } as any);
    },
    info: ({ title, description }: ToastMessage) => {
        toast.info(description, {
            ...(title && { title }),
        } as any);
    },
    default: ({ title, description }: ToastMessage) => {
        toast(description, {
            ...(title && { title }),
        } as any);
    },
}; 