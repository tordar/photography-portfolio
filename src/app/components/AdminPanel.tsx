'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import type { Session } from "next-auth"
import { supabase } from '@/lib/supabase'
import { upload } from '@vercel/blob/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminPanel() {
    const [file, setFile] = useState<File | null>(null)
    const [tags, setTags] = useState<string[]>([])
    const [allTags, setAllTags] = useState<string[]>([])
    const [selectedTag, setSelectedTag] = useState<string>('')
    const [newTag, setNewTag] = useState('')
    const [description, setDescription] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const router = useRouter()
    const { data: session } = useSession() as { data: Session | null }

    useEffect(() => {
        const fetchTags = async () => {
            try {
                console.log('Fetching tags...')
                const { data, error } = await supabase
                    .from('image_metadata')
                    .select('tags')

                if (error) {
                    throw error
                }

                console.log('Received data:', data)
                const uniqueTags = Array.from(new Set(data?.flatMap(item => item.tags || []) || []))
                console.log('Unique tags:', uniqueTags)
                setAllTags(uniqueTags)
            } catch (error) {
                console.error('Error fetching tags:', error)
                setError('Failed to load tags. Please try again.')
            }
        }

        fetchTags()
    }, [])

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            const { url, pathname } = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/blob-upload',
            })

            console.log('Upload successful:', { url, pathname })

            const { error: supabaseError } = await supabase
                .from('image_metadata')
                .insert({
                    blob_url: url,
                    blob_pathname: pathname,
                    tags: tags,
                    description: description
                })

            if (supabaseError) {
                throw supabaseError
            }

            setFile(null)
            setTags([])
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

    const handleAddTag = useCallback(() => {
        if (selectedTag && !tags.includes(selectedTag)) {
            setTags(prev => [...prev, selectedTag])
            setSelectedTag('')
        } else if (newTag && !allTags.includes(newTag)) {
            setAllTags(prev => [...prev, newTag])
            setTags(prev => [...prev, newTag])
            setNewTag('')
        }
    }, [selectedTag, newTag, tags, allTags])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }, [])

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name || 'Admin'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="file">Select Image</Label>
                    <Input
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
                    />
                </div>
                <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex space-x-2">
                        <Select
                            value={selectedTag}
                            onValueChange={setSelectedTag}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {allTags.map((tag) => (
                                    <SelectItem key={tag} value={tag}>
                                        {tag}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="New tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                        />
                        <Button type="button" onClick={handleAddTag}>Add Tag</Button>
                    </div>
                    <div className="mt-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-2 text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your image..."
                    />
                </div>
                <Button type="submit" disabled={!file || uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
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
            <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
    )
}

