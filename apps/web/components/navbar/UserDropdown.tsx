'use client'
import { Suspense, useState } from "react";
import { LogOut, Settings } from "lucide-react";
import dynamic from 'next/dynamic'
import { ICustomUser } from "@/app/api/auth/[...nextauth]/options";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

const LogoutModal = dynamic(() => import('@/components/auth/LogoutModal'))

const UserDropdown = ({ user }: { user: ICustomUser }) => {
    const [logoutOpen, setLogoutOpen] = useState(false);
    return (
        <>
            {logoutOpen && <Suspense> <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} /> </Suspense>}
            <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-0">
                    <Avatar className="size-8">
                        <AvatarImage src={user?.image as string} />
                        <AvatarFallback className="">{(user?.name as string).split(' ').map((w) => w[0])}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="flex flex-col text-md">
                        {user?.name} <span className="text-sm text-gray-500">{user?.email} </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Settings />Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLogoutOpen(s => !s)}>
                        <LogOut />Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}

export default UserDropdown;