"use client"

import { useEffect, useState } from "react"

export const RemainingTime = ({ endDate }: { endDate: Date }) => {
    const [remaining, setRemaining] = useState<string>("計算中...")
    const [dateString, setDateString] = useState("")

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date()
            const diffInMs = endDate.getTime() - now.getTime()

            if (diffInMs < 0) {
                return { display: "終了済み", date: endDate.toLocaleDateString() }
            }

            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
            const days = Math.floor(diffInHours / 24)
            const hours = diffInHours % 24
            const minutes = Math.floor((diffInMs % (1000 * 60)) / 1000)

            return {
                display: `${days > 0 ? `${days}日` : ""}${hours}時間${minutes}分`,
                date: endDate.toLocaleDateString()
            }
        }

        // 初回計算
        const result = calculateTime()
        setRemaining(result.display)
        setDateString(result.date)

        // 1分ごとに更新
        const interval = setInterval(() => {
            const result = calculateTime()
            setRemaining(result.display)
        }, 60000)

        return () => clearInterval(interval)
    }, [endDate])

    return (
        <div className="text-sm">
            {remaining === "終了済み" ? (
                <span className="text-red-500">{remaining}</span>
            ) : (
                <>
                    <span>{remaining}</span>
                    {/* <div className="text-xs text-muted-foreground">
                        ({dateString})
                    </div> */}
                </>
            )}
        </div>
    )
}