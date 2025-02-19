import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCallback } from "react";

interface BaseRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const BaseRegisterModal = ({
    isOpen,
    onClose,
    title = "商品登録",
    children
}: BaseRegisterModalProps) => {
    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) {
            const confirmed = window.confirm('編集内容が失われますが、よろしいですか？');
            if (confirmed) {
                onClose();
            }
        }
    }, [onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[1600px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};
