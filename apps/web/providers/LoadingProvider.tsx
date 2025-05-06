"use client"
import { createContext, useContext, useState } from "react";
import DoodleLoading from "@/app/(home)/_components/visuals/DoodleLoading";

const LoadingContext = createContext({
    isLoading: false,
    setIsLoading: (loading: boolean) => {}
})

export const useLoading = () => useContext(LoadingContext);
const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
          {isLoading ? <DoodleLoading /> : children}
          {/* {children} */}
        </LoadingContext.Provider>
    );
}

export default LoadingProvider;