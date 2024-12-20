'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ImageMetadata {
    id: string
    blob_url: string
    blob_pathname: string
    tags: string[]
    description: string
    created_at: string
}

interface TaggedGalleryProps {
    tag: string
}

export default function TaggedGallery({ tag }: TaggedGalleryProps) {
    const [images, setImages] = useState<ImageMetadata[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchImages() {
            try {
                const response = await fetch(`/api/images/by-tag?tag=${encodeURIComponent(tag)}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch images')
                }
                const data = await response.json()
                setImages(data.images)
            } catch (err) {
                setError('Failed to load images')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [tag])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                    <div key={image.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                        <Image
                            src={image.blob_url}
                            alt={image.description || 'Uploaded image'}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300">
                            <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="font-bold">{image.description}</p>
                                <p className="text-sm mt-2">Tags: {image.tags.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

