import { ReactNode } from "react";

interface ErrorPageProps {
    imageSrc: string,
    title: string,
    body: string,
    children: ReactNode,
}

const ErrorPage = ({ imageSrc, title, body, children }: ErrorPageProps) => {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#0C0C0C]">
            <div className="flex flex-col items-center gap-3 max-w-[350px] sm:max-w-md w-full p-8 bg-white rounded-xl shadow-sm">
                <img
                    src={imageSrc}
                    alt="Error Image"
                    width={128}
                    height={128}
                    className="size-32 sm:size-56"
                />
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-2xl font-bold text-zinc-800 font-heading">{title}</h1>
                    <p className="text-zinc-600 text-center font-body">
                        {body}
                    </p>
                    <div className="flex gap-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;