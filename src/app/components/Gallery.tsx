'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { FullscreenImage } from './FullscreenImage'

interface ImageMetadata {
    id: string
    blob_url: string
    blob_pathname: string
    tags: string[]
    description: string
    created_at: string
    width?: number
    height?: number
}

interface GalleryProps {
    images: ImageMetadata[]
}

export default function Gallery({ images }: GalleryProps) {
    const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)
    const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

    const handleImageLoad = useCallback((imageId: string) => {
        setLoadedImages(prev => new Set([...Array.from(prev), imageId]))
    }, [])

    const openFullscreen = useCallback((index: number) => {
        setFullscreenIndex(index)
    }, [])

    const closeFullscreen = useCallback(() => {
        setFullscreenIndex(null)
    }, [])

    const navigateFullscreen = useCallback((newIndex: number) => {
        setFullscreenIndex(newIndex)
    }, [])

    return (
        <>
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative cursor-pointer overflow-hidden rounded-lg transition-all duration-700 ease-out ${
                                loadedImages.has(image.id) 
                                    ? 'opacity-100 transform translate-y-0' 
                                    : 'opacity-0 transform translate-y-4'
                            }`}
                            style={{
                                transitionDelay: `${index * 150}ms`
                            }}
                            onClick={() => openFullscreen(index)}
                        >
                            <div className="aspect-w-4 aspect-h-3">
                                <Image
                                    src={image.blob_url}
                                    alt={image.description || 'Gallery image'}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
                                    className={`object-cover transition-transform duration-300 hover:scale-105 ${
                                        image.width && image.height && image.height > image.width
                                            ? '[object-position:50%_30%]'
                                            : ''
                                    }`}
                                    onLoad={() => handleImageLoad(image.id)}
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity duration-300 flex items-end">
                                <div className="p-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <p className="font-bold text-sm line-clamp-1">{image.description}</p>
                                    <p className="text-xs mt-1 line-clamp-1">Tags: {image.tags.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {fullscreenIndex !== null && (
                <FullscreenImage
                    images={images}
                    currentIndex={fullscreenIndex}
                    onClose={closeFullscreen}
                    onNavigate={navigateFullscreen}
                />
            )}
        </>
    )
}

