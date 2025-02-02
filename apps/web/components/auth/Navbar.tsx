import { ICustomUser } from "@/app/api/auth/[...nextauth]/options";
import LoginModal from "./LoginModal";

const Navbar = ({user}:{user:ICustomUser | undefined}) => {
    return ( 
        <div className="w-full bg-black p-5 text-lg text-white">
            {user ? user.name : <LoginModal />}
        </div>
     );
}
 
export default Navbar;