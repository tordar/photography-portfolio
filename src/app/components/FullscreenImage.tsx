import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

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

interface FullscreenImageProps {
    images: ImageMetadata[]
    currentIndex: number
    onClose: () => void
    onNavigate: (newIndex: number) => void
}

export function FullscreenImage({ images, currentIndex, onClose, onNavigate }: FullscreenImageProps) {
    const currentImage = images[currentIndex]

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose()
        } else if (event.key === 'ArrowLeft') {
            onNavigate((currentIndex - 1 + images.length) % images.length)
        } else if (event.key === 'ArrowRight') {
            onNavigate((currentIndex + 1) % images.length)
        }
    }, [currentIndex, images.length, onClose, onNavigate])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                aria-label="Close fullscreen image"
            >
                <X className="w-8 h-8" />
            </button>
            <button
                onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
                className="absolute left-4 text-white hover:text-gray-300 focus:outline-none"
                aria-label="Previous image"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={() => onNavigate((currentIndex + 1) % images.length)}
                className="absolute right-4 text-white hover:text-gray-300 focus:outline-none"
                aria-label="Next image"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto">
                <Image
                    src={currentImage.blob_url}
                    alt={currentImage.description || 'Fullscreen image'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
            </div>
        </div>
    )
}

