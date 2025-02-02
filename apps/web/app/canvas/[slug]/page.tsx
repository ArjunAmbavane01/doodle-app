const CanvasRoom = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    return ( 
        <div>
            Welcome to {slug || 'error'}
        </div>
     );
}
 
export default CanvasRoom;