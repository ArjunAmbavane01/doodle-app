import Image from "next/image";

const AppDemo = () => {
    return ( 
        <section className="flex w-full">
            <div className="flex justify-center items-center max-w-7xl w-full mx-auto bg-black rounded-xl h-[500px] -translate-y-12">
                <Image src={'/images/appDemo.png'} alt={'appdemo'} width={300} height={300} className="w-full h-full"/>
            </div>
        </section>
     );
}
 
export default AppDemo;