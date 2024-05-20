import React, { useId } from "react";
// @ts-ignore
import { drawParliamentSVG } from "./parliamentArch.js";
import { useEffect } from "react";


interface Candidacy {
    color: string
    seats: number
}

interface ParliamentArchProps {
    candidacies: Candidacy[],
    className?: string
}


export default function ParliamentArch({ candidacies, className }: ParliamentArchProps) {
    const ident = useId()
    useEffect(() => {
        let candidacies_parliament: Candidacy[] = candidacies

        if ((candidacies?.length || 0) == 0) {
            candidacies_parliament = [
                { color: "black", seats: 0 }
            ]
        } else {
            candidacies_parliament = candidacies
        }

        const drawParliament = () => {
            drawParliamentSVG(
                ident,
                candidacies_parliament,
                "black",
            );
        }
        drawParliament();
    }, [ident, candidacies])



    return (
        <svg id={ident} className={`${className} w-full h-auto`}>

        </svg>
    )
}