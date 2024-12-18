import { X } from 'lucide-react'
import Image from 'next/image'

interface FullscreenImageProps {
    src: string
    alt: string
    onClose: () => void
}

export function FullscreenImage({ src, alt, onClose }: FullscreenImageProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
                aria-label="Close fullscreen image"
            >
                <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
            </div>
        </div>
    )
}

