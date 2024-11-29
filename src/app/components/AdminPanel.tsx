'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

export default function AdminPanel() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const { data: session } = useSession()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                console.log('File uploaded:', data.url)
                setFile(null)
                router.refresh()
            } else {
                console.error('Upload failed')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleSignOut = async () => {
        await signOut({ redirect: false })
        router.push('/admin/signin')
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name || 'Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
                />
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>
            <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sign Out
            </button>
        </div>
    )
}

