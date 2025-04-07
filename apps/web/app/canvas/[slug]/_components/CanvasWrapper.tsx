'use client'
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useLoading } from "@/providers/LoadingProvider";
import ErrorPage from "@/components/ErrorPage";
import { IRoomChat } from "@workspace/common/messages";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Link, RefreshCw } from "lucide-react";

const CanvasWrapper = ({ wsToken, roomMessages, userId, sessionId }: { wsToken: string, roomMessages: IRoomChat[], userId: string, sessionId: string }) => {
    const { setIsLoading } = useLoading();
    const socketRef = useRef<WebSocket | null>(null);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    useEffect(() => {
        setIsLoading(true);

        if (!socketRef.current) {
            try {
                socketRef.current = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);
                socketRef.current.onopen = () => {
                    socketRef.current?.send(JSON.stringify({ type: "join_room" }))
                    setIsLoading(false);
                    setConnectionError(null)
                };
                socketRef.current.onclose = (e) => {
                    console.log("WebSocket closed:", event);
                    socketRef.current = null;
                    setIsLoading(false);
                    if (!e.wasClean) {
                        setConnectionError("Connection to room was lost. Please try again.");
                    }
                };
                socketRef.current.onerror = (error) => {
                    console.error("WebSocket error:", error);
                    setIsLoading(false);
                    setConnectionError("Failed to connect to room. Please try again.");
                };
                const timeoutId = setTimeout(() => {
                    if (socketRef.current?.readyState !== WebSocket.OPEN) {
                        setIsLoading(false);
                        setConnectionError("Connection timed out. Please try again.");
                    }
                }, 10000);

                return () => {
                    clearTimeout(timeoutId);
                    if (socketRef.current) {
                        socketRef.current.close();
                        socketRef.current = null;
                    }
                    setIsLoading(false);
                };
            } catch (error) {
                console.error("Error creating WebSocket:", error);
                setIsLoading(false);
                setConnectionError("Failed to connect to room. Please try again.");
            }
        }
    }, [wsToken])

    if (connectionError) {
        return (
            <ErrorPage imageSrc="/error/404-cuate.svg" title="Connection Error" body={connectionError} >
                <Button asChild variant="outline">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Home
                    </Link>
                </Button>
                <Button onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </ErrorPage>
        );
    }

    return <Canvas socket={socketRef.current} roomMessages={roomMessages} userId={userId} sessionId={sessionId} />
}

export default CanvasWrapper;