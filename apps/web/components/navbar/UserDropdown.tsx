'use client'
import { Suspense, useState } from "react";
import dynamic from 'next/dynamic'
import { ICustomUser } from "@/app/api/auth/[...nextauth]/options";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { LogOut } from "lucide-react";

const LogoutModal = dynamic(() => import('@/components/auth/LogoutModal'))

const UserDropdown = ({ user }: { user: ICustomUser | undefined }) => {
    const [logoutOpen, setLogoutOpen] = useState(false);
    return (
        <>
            {logoutOpen && <Suspense> <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} /> </Suspense>}
            <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-0" asChild>
                    <Button className="flex items-center justify-between gap-2 md:gap-3 px-2 md:px-3 md:py-5 bg-white text-black rounded-full">
                        <Avatar className="size-5 md:size-8 rounded-full p-0">
                            <AvatarImage src={user?.image as string} />
                            <AvatarFallback className="bg-[#33691e] text-white">{(user?.name as string).split(' ').map((w) => w[0])}</AvatarFallback>
                        </Avatar>
                        <span className="font-body font-semibold text-xs md:text-sm">Hey, {user?.name?.split(' ')[0]}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                    <DropdownMenuLabel className="flex flex-col font-body text-sm text-black">
                        {user?.name} <span className="text-xs md:text-sm text-zinc-700">{user?.email} </span>
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setLogoutOpen(s => !s)} className="text-xs md:text-sm hover:cursor-pointer bg-red-500 text-white hover:!bg-red-500/85 hover:!text-white">
                        <LogOut />Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export default UserDropdown;