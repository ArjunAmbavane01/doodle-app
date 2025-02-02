import { getServerSession } from "next-auth";
import { authOptions, ICustomSession } from "../api/auth/[...nextauth]/options";
import Profile from "./_components/Profile";

const page = async () => {
    const session:ICustomSession|null = await getServerSession(authOptions) ;

    // use name as session?.user?.name 
    // when using logout model create as state lgoutopen,setlgoutopen = false and pass it to logoutmodal

    // and use dynamic loading 
    // import loutgout model = dynamic();

    // and useing it - 
    // lgoutopen && <suspense fallback>logout open =lgoutopen</suspnse>

    return ( 
    <div>
        hello
        <Profile />
    </div>
     );
}
 
export default page;