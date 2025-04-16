import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "./TransactionForm";
import { Transaction } from "@/types/antique-ledger";
import { toast } from "sonner";
import * as z from "zod";
import { transactionSchema } from "@/validations/antique-ledger";

interface TransactionDialogProps {
    type: "create" | "edit" | "view";
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction;
    onSuccess?: () => void;
}

export function TransactionDialog({
    type,
    isOpen,
    onClose,
    transaction,
    onSuccess,
}: TransactionDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: z.infer<typeof transactionSchema>) => {
        setIsSubmitting(true);
        try {
            if (type === "create") {
                const response = await fetch("/api/antique-ledger/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "古物台帳の登録に失敗しました");
                }

                toast.success("古物台帳を登録しました");
            } else if (type === "edit" && transaction) {
                const response = await fetch(`/api/antique-ledger/transactions/${transaction.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "古物台帳の更新に失敗しました");
                }

                toast.success("古物台帳を更新しました");
            }

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("エラーが発生しました");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case "create":
                return "古物台帳登録";
            case "edit":
                return "古物台帳編集";
            case "view":
                return "古物台帳詳細";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                </DialogHeader>
                <TransactionForm
                    defaultValues={transaction}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    readOnly={type === "view"}
                />
            </DialogContent>
        </Dialog>
    );
} 