'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Canvas from "./Canvas";
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useLoading } from "@/providers/LoadingProvider";
import ErrorPage from "@/components/ErrorPage";
import { IRoomChat } from "@workspace/common/messages";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, RefreshCw } from "lucide-react";

const CanvasWrapper = ({ wsToken, roomMessages, userId, sessionId }: { wsToken: string, roomMessages: IRoomChat[], userId: string, sessionId: string }) => {
    const { setIsLoading } = useLoading();
    const socketRef = useRef<WebSocket | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {

        const maxRetries = 3;
        let retryCount = 0;

        const connectWebSocket = () => {
            try {
                socketRef.current = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);

                socketRef.current.onopen = () => {
                    retryCount = 0;
                    socketRef.current?.send(JSON.stringify({ type: "join_room" }))
                    setIsLoading(false);
                    setConnectionError(null);
                };

                socketRef.current.onclose = (e) => {
                    console.log("WebSocket closed:", e);
                    if (!e.wasClean && retryCount < maxRetries) {
                        retryCount++;
                        console.log(`Retry attempt ${retryCount}...`);
                        setTimeout(connectWebSocket, 1000);
                    } else {
                        socketRef.current = null;
                        setIsLoading(false);
                        if (!e.wasClean) {
                            setConnectionError("Connection to room was lost. Please try again.");
                        }
                    }
                };

                socketRef.current.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };
            } catch (error) {
                console.error("Error creating WebSocket:", error);
                setIsLoading(false);
                setConnectionError("Failed to connect to room. Please try again.");
            }
        };

        setIsLoading(true);
        if (!socketRef.current) connectWebSocket()

    }, [wsToken])

    if (connectionError) {
        return (
            <ErrorPage imageSrc="/error/connection.png" title="Connection Error" body={connectionError} >
                <Button asChild variant="outline" className="group w-32">
                    <Link href="/">
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-all duration-300" />
                        Go Home
                    </Link>
                </Button>
                <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="size-4" />
                    Try Again
                </Button>
            </ErrorPage>
        );
    }

    return <Canvas socket={socketRef.current} roomMessages={roomMessages} userId={userId} sessionId={sessionId} />
}

export default CanvasWrapper;