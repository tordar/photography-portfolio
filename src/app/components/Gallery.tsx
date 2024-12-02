import Image from 'next/image'
import { ListBlobResultBlob } from '@vercel/blob'

interface GalleryProps {
    blobs: ListBlobResultBlob[]
}

export default function Gallery({ blobs }: GalleryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blobs.map((blob) => (
                <div key={blob.url} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src={blob.url}
                        alt={blob.pathname}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            ))}
        </div>
    )
}

