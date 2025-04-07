'use client'
import { Suspense, useState } from "react";
import dynamic from 'next/dynamic'
import { ICustomUser } from "@/app/api/auth/[...nextauth]/options";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { LogOut } from "lucide-react";

const LogoutModal = dynamic(() => import('@/components/auth/LogoutModal'))

const UserDropdown = ({ user }: { user: ICustomUser | undefined }) => {
    const [logoutOpen, setLogoutOpen] = useState(false);
    return (
        <>
            {logoutOpen && <Suspense> <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} /> </Suspense>}
            <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-0">
                    <Avatar className="size-6 md:size-8">
                        <AvatarImage src={user?.image as string} />
                        <AvatarFallback className="">{(user?.name as string).split(' ').map((w) => w[0])}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                    <DropdownMenuLabel className="flex flex-col font-body text-sm text-zinc-800">
                        {user?.name} <span className="text-sm text-zinc-600">{user?.email} </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLogoutOpen(s => !s)} className="hover:cursor-pointer bg-red-500 text-white hover:!bg-red-500/85 hover:!text-white">
                        <LogOut />Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export default UserDropdown;