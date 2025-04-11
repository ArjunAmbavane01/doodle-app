import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions, ICustomSession } from "@/app/api/auth/[...nextauth]/options";
import { JOIN_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import CanvasWrapper from "./_components/CanvasWrapper";
import ErrorPage from "@/components/ErrorPage";
import { ArrowLeft, RefreshCw, } from "lucide-react";

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    try {
        const session: ICustomSession | null = await getServerSession(authOptions);
        const { slug } = await params;

        if (!session?.user?.token) {
            return (
                <ErrorPage imageSrc="/error/google-auth.svg" title="Authentication Required" body=" Please log in to your account to join this collaborative drawing room.">
                    <Button asChild variant="outline" className="group">
                        <Link href="/">
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-all duration-300" />
                            Go Home
                        </Link>
                    </Button>
                </ErrorPage>
            )
        }

        const response = await fetch(JOIN_ROOM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug })
        });

        const data = await response.json();

        if (data.type === 'error') {
            console.error(data.message);
            return (
                <ErrorPage imageSrc={response.status=== 500 ? "/error/505-dog.jpg" : "/error/404-cuate.svg"} title={response.status === 500 ? 'Internal Server Error' : 'Room Not Found'} body={response.status === 500 ? "Failed to connect to room. Please try again." : "The drawing room you're looking for doesn't exist or you don't have permission to join it."}>
                    <Button asChild variant="outline" className="group">
                        <Link href="/">
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-all duration-300" />
                            Go Home
                        </Link>
                    </Button>
                </ErrorPage>
            )
        }

        const wsToken = data?.data?.token;
        const roomMessages = data?.data?.roomMessages;
        const userId = session?.user?.id;
        return <CanvasWrapper wsToken={wsToken} roomMessages={roomMessages} userId={userId as unknown as string} sessionId={slug} />
    } catch (e) {
        console.error(e);
        return (
            <ErrorPage imageSrc="/error/connection.png" title="Connection Error" body=" We couldn't connect you to this drawing room. This might be due to a temporary issue.">
                <Button asChild variant="outline" className="group">
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
        )
    }
}

export default page;