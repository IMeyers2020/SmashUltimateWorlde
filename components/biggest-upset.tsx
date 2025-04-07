"use client"

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { fetchBiggestUpset } from "@/lib/startgg-api";
import { Player } from "@/lib/types";


export default function BiggestUpset() {
    const [biggestUpset, setBiggestUpset] = useState<{ winningPlayerName: string, losingPlayerName: string, winningPlayerSeed: number, losingPlayerSeed: number, bracketName: string}>()

    useEffect(() => {
        fetchBiggestUpset().then(u => {
            setBiggestUpset({
                winningPlayerName: u.winningPlayer ?? "",
                losingPlayerName: u.losingPlayer ?? "",
                winningPlayerSeed: u.winningPlayerSeed ?? -1,
                losingPlayerSeed: u.losingPlayerSeed ?? -1,
                bracketName: u.bracketName
            })
        })
    }, [])

    if(!biggestUpset) return;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="w-full mt-8 text-slate-600 border">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Biggest Upset of the Week</CardTitle>
                </CardHeader>
                <hr className="mb-5 text-slate-600" />
                <CardContent>
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col sm:flex-row flex-1 items-center justify-center gap-4">
                            <div className="flex flex-col items-center rounded bg-green-100 px-2 py-1">
                                <p className="font-bold mt-2">{biggestUpset.winningPlayerName}</p>
                                <p className="text-sm text-muted-foreground">Seed #{biggestUpset.winningPlayerSeed}</p>
                            </div>
                            <div className="text-2xl font-bold">{">"}</div>
                            <div className="flex flex-col items-center rounded bg-red-100 px-2 py-1">
                                <p className="font-bold mt-2">{biggestUpset.losingPlayerName}</p>
                                <p className="text-sm text-muted-foreground">Seed #{biggestUpset.losingPlayerSeed}</p>
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground"><strong>{`At ${biggestUpset.bracketName}`}</strong></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

