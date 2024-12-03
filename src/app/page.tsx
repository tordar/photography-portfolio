import { list } from '@vercel/blob'
import Gallery from './components/Gallery'
import { unstable_noStore as noStore } from 'next/cache';

export default async function Home() {
    // Opt out of caching for this page
    noStore();
    const { blobs } = await list()

    console.log('Fetched blobs:', blobs)

    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center mb-12">My Photography Portfolio</h1>
                {blobs.length > 0 ? (
                    <Gallery blobs={blobs} />
                ) : (
                    <p className="text-center text-gray-500">No images uploaded yet. (Blob count: {blobs.length})</p>
                )}
            </div>
        </main>
    )
}

