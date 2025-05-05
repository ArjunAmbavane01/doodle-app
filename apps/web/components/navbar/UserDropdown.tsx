'use client'
import { Suspense, useState } from "react";
import dynamic from 'next/dynamic'
import { ICustomUser } from "@/app/api/auth/[...nextauth]/options";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { LogOut } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

const LogoutModal = dynamic(() => import('@/components/auth/LogoutModal'))

const UserDropdown = ({ user }: { user: ICustomUser | undefined }) => {
    const [logoutOpen, setLogoutOpen] = useState(false);
    return (
        <>
            {logoutOpen && <Suspense> <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} /> </Suspense>}
            <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:ring-0" asChild>
                    <Button className="flex gap-2 px-2 py-3 bg-white text-black hover:bg-white/90 rounded-full group">
                        <span className="hidden group-hover:block text-sm transition-transform duration-300">Hey, {user?.name?.split(' ')[0]}</span>
                        <Avatar className="size-6 md:size-8 outline-2 outline-white rounded-full">
                            <AvatarImage src={user?.image as string} />
                            <AvatarFallback className="">{(user?.name as string).split(' ').map((w) => w[0])}</AvatarFallback>
                        </Avatar>
                    </Button>
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