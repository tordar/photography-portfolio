import Gallery from './components/Gallery'


export default function Home() {
    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center mb-12">My Photography Portfolio</h1>
                <Gallery />
                {/*<div className="mt-12">*/}
                {/*    <TaggedGallery tag="nature" />*/}
                {/*</div>*/}
            </div>
        </main>
    )
}

