import {
    Card,
    CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import React from 'react'
import TruckerForm from "../components/forms/TruckerForm";

interface TruckerClearanceProps {

}

const TruckerClearance: React.FC<TruckerClearanceProps> = () => {
    return <>
        <Card>
            <CardHeader>
                <CardTitle>Trucker Clearance</CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <TruckerForm/>
            </CardContent>
        </Card>
    </>;
}

export default TruckerClearance