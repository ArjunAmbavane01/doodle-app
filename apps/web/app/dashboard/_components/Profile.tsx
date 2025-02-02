'use client'

import LogoutModal from "@/components/auth/LogoutModal";
import { useState } from "react";


const Profile = () => {
    const [logoutOpen,setLogoutOpen] = useState(false)

    return ( 
        <div className="w-96 h-96 mx-auto p-10 bg-blue-500">
            <button className="p-3 bg-black text-white rounded" onClick={()=>setLogoutOpen(true)}>Logout </button>
        {logoutOpen && <LogoutModal open={logoutOpen} setOpen={setLogoutOpen} />}
        </div>
     );
}
 
export default Profile;