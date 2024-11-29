import Image from 'next/image'
import { list } from '@vercel/blob'

export default async function Gallery() {
  const { blobs } = await list()

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blobs.map((blob) => (
            <div key={blob.url} className="relative h-64 w-full">
              <Image
                  src={blob.url}
                  alt={blob.pathname}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
        ))}
      </div>
  )
}

