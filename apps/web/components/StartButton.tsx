'use client'

import axios from "axios";
import { useRouter } from "next/navigation";

const StartButton = ({userId}:{userId:string}) => {
    const router = useRouter();
    const handleStart = async () => {
        const { data } = await axios.post('http://localhost:8000/api/canvas/rooms', {
            userId
        });
        console.log(data.data.slug)
        if (data.type === 'success') {
            router.push(`/canvas/${data.data.slug}`)
        }
        else {
            console.log('error occured');
        }
    }

    return ( 
        <button className="bg-black p-3 rounded text-white mt-10" onClick={handleStart}>
                start doodling
            </button>
     );
}
 
export default StartButton;