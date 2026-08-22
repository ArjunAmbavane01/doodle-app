"use client";

import { Button } from "@workspace/ui/components/button";
import { RefreshCw } from "lucide-react";

export default function TryAgainButton() {
    return (
        <Button className="shadow-sm shadow-blue-300" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Try Again
        </Button>
    );
}