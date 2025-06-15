import { useEffect, useCallback, useState } from 'react'
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
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    // Prevent background scrolling when fullscreen is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
        return () => {
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
        }
    }, [])

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose()
        } else if (event.key === 'ArrowLeft') {
            onNavigate((currentIndex - 1 + images.length) % images.length)
        } else if (event.key === 'ArrowRight') {
            onNavigate((currentIndex + 1) % images.length)
        }
    }, [currentIndex, images.length, onClose, onNavigate])

    const handleTouchStart = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault()
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        setTouchEnd(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        if (!touchStart || !touchEnd) return

        const distance = touchStart - touchEnd
        const isLeftSwipe = distance > 50
        const isRightSwipe = distance < -50

        if (isLeftSwipe) {
            onNavigate((currentIndex + 1) % images.length)
        } else if (isRightSwipe) {
            onNavigate((currentIndex - 1 + images.length) % images.length)
        }

        setTouchStart(null)
        setTouchEnd(null)
    }

    const handleCloseTouch = (e: React.TouchEvent) => {
        e.stopPropagation();
        onClose();
    }

    const handleImageAreaClick = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const isLeftSide = x < rect.width / 2

        if (isLeftSide) {
            onNavigate((currentIndex - 1 + images.length) % images.length)
        } else {
            onNavigate((currentIndex + 1) % images.length)
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown])

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <button
                onClick={onClose}
                onTouchEnd={handleCloseTouch}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none p-2 bg-black bg-opacity-50 rounded-full z-50"
                aria-label="Close fullscreen image"
            >
                <X className="w-8 h-8" />
            </button>
            <div 
                className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto cursor-pointer"
                onClick={handleImageAreaClick}
            >
                <Image
                    src={currentImage.blob_url}
                    alt={currentImage.description || 'Fullscreen image'}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority
                />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    )
}

