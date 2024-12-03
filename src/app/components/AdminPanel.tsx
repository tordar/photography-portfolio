'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import type { Session } from "next-auth"


export default function AdminPanel() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { data: session } = useSession() as { data: Session | null }

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setUploadProgress(0)
        setError(null)

        try {
            // First, get the upload credentials
            const credentialsResponse = await fetch('/api/get-upload-url')
            if (!credentialsResponse.ok) {
                throw new Error('Failed to get upload credentials')
            }
            const { uploadUrl, token } = await credentialsResponse.json()

            // Then upload directly to Blob storage
            const response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': file.type,
                    'x-content-type': file.type,
                },
                body: file
            })

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`)
            }

            const result = await response.json()
            console.log('Upload successful:', result)
            setFile(null)
            setUploadProgress(100)
            router.refresh()
        } catch (error) {
            console.error('Upload error:', error)
            setError(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
            setUploading(false)
        }
    }, [file, router])

    const handleSignOut = useCallback(async () => {
        await signOut({ redirect: false })
        router.push('/admin/signin')
    }, [router])

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name || 'Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const selectedFile = e.target.files?.[0]
                        if (selectedFile) {
                            console.log('File selected:', selectedFile.name, 'Size:', selectedFile.size)
                            setFile(selectedFile)
                        }
                    }}
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
            {uploading && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{width: `${uploadProgress}%`}}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 text-red-500 rounded">
                    {error}
                </div>
            )}
            <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sign Out
            </button>
        </div>
    )
}

