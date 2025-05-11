"use client"
import { createContext, useContext, useMemo, useState } from "react";
import DoodleLoading from "@/app/(home)/_components/visuals/DoodleLoading";

const LoadingContext = createContext({
    isLoading: false,
    setIsLoading: (loading: boolean) => { }
})

export const useLoading = () => useContext(LoadingContext);
const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const value = useMemo(() => ({ isLoading, setIsLoading }), [isLoading]);
    return (
        <LoadingContext.Provider value={value}>
            {isLoading && <DoodleLoading />}
            {children}
        </LoadingContext.Provider>
    );
}

export default LoadingProvider;