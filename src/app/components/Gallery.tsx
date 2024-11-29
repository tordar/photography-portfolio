import Image from 'next/image'
import { PutBlobResult } from '@vercel/blob'

interface GalleryProps {
  images: PutBlobResult[]
}

export default function Gallery({ images }: GalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.url} className="relative h-64 w-full">
          <Image
            src={image.url}
            alt={image.pathname}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  )
}

