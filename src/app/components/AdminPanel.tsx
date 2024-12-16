'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import type { Session } from "next-auth"
import { supabase } from '@/lib/supabase'
import { upload } from '@vercel/blob/client'

export default function AdminPanel() {
    const [file, setFile] = useState<File | null>(null)
    const [tags, setTags] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const router = useRouter()
    const { data: session } = useSession() as { data: Session | null }

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            // Upload the file using the Vercel Blob client
            const { url, pathname } = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/blob-upload',
            })

            console.log('Upload successful:', { url, pathname })

            // Store metadata in Supabase
            const { error: supabaseError } = await supabase
                .from('image_metadata')
                .insert({
                    blob_url: url,
                    blob_pathname: pathname,
                    tags: tags.split(',').map(tag => tag.trim()),
                    description: description
                })

            if (supabaseError) {
                throw supabaseError
            }

            setFile(null)
            setTags('')
            setDescription('')
            router.refresh()
        } catch (error) {
            console.error('Upload error:', error)
            setError(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
            setUploading(false)
        }
    }, [file, tags, description, router])

    const handleSignOut = useCallback(async () => {
        await signOut({ redirect: false })
        router.push('/admin/signin')
    }, [router])

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name || 'Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">Select Image</label>
                    <input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const selectedFile = e.target.files?.[0]
                            if (selectedFile) {
                                console.log('File selected:', selectedFile.name, 'Size:', selectedFile.size)
                                setFile(selectedFile)
                            }
                        }}
                        className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                    <input
                        id="tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="nature, landscape, sunset"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        rows={3}
                        placeholder="Describe your image..."
                    />
                </div>
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
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div>
                    </div>
                    <p className="text-sm text-gray-600">Uploading... This may take a while for larger files.</p>
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

