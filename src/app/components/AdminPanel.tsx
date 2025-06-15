'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { ImageManagementTable } from './ImageManagementTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPanel() {
    const [files, setFiles] = useState<FileList | null>(null)
    const [tags, setTags] = useState<string[]>([])
    const [allTags, setAllTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')
    const [description, setDescription] = useState<string>('')
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [selectedTag, setSelectedTag] = useState<string>('')
    const router = useRouter()
    const { data: session } = useSession() as { data: Session | null }
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchTags() {
            try {
                const response = await fetch('/api/tags')
                if (!response.ok) {
                    console.error('Error fetching tags')
                    return
                }
                const data = await response.json()
                // Filter out any empty strings or null values
                const validTags = (data.tags || []).filter((tag: string) => tag && tag.trim() !== '')
                console.log('Fetched tags:', validTags) // Debug log
                setAllTags(validTags)
            } catch (error) {
                console.error('Error in fetchTags:', error)
            }
        }
        fetchTags()
    }, [])

    const sanitizeFileName = (fileName: string) => {
        return fileName.replace(/#/g, '%23').replace(/[^a-zA-Z0-9.-]/g, '_')
    }

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!files || files.length === 0) return

        setUploading(true)
        setUploadProgress(0)

        try {
            const totalFiles = files.length
            let uploadedFiles = 0

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i]
                const sanitizedFileName = sanitizeFileName(file.name)
                const uniqueFileName = `${Date.now()}-${sanitizedFileName}`

                // Create FormData for the file upload
                const formData = new FormData()
                formData.append('file', file)
                formData.append('tags', JSON.stringify(tags))
                formData.append('description', description)

                // Upload to the server-side route
                const response = await fetch('/api/blob-upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`)
                }

                const { url, pathname } = await response.json()

                uploadedFiles++
                setUploadProgress((uploadedFiles / totalFiles) * 100)
            }

            toast({
                title: "Upload Successful",
                description: `${totalFiles} image${totalFiles > 1 ? 's' : ''} uploaded successfully.`,
            })

            setFiles(null)
            setTags([])
            setDescription('')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            router.refresh()
        } catch (error) {
            console.error('Upload error:', error)
            toast({
                title: "Upload Failed",
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                variant: "destructive",
            })
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }, [files, tags, description, router, toast])

    const handleSignOut = useCallback(async () => {
        await signOut({ redirect: false })
        router.push('/admin/signin')
    }, [router])

    const handleAddTag = useCallback((tagToAdd: string) => {
        if (tagToAdd && tagToAdd.trim() !== '' && !tags.includes(tagToAdd)) {
            setTags(prev => [...prev, tagToAdd])
            if (!allTags.includes(tagToAdd)) {
                setAllTags(prev => [...prev, tagToAdd])
            }
            setNewTag('')
            setSelectedTag('')
        }
    }, [tags, allTags])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }, [])

    // Filter out any empty tags before rendering
    const validTags = allTags.filter(tag => tag && tag.trim() !== '')

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name || 'Admin'}</h2>
            <Tabs defaultValue="upload">
                <TabsList>
                    <TabsTrigger value="upload">Upload Images</TabsTrigger>
                    <TabsTrigger value="manage">Manage Images</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="file">Select Images</Label>
                            <Input
                                id="file"
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                onChange={(e) => setFiles(e.target.files)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex space-x-2">
                                {validTags.length > 0 && (
                                    <Select 
                                        value={selectedTag}
                                        onValueChange={(value) => {
                                            if (value && value.trim() !== '') {
                                                setSelectedTag(value)
                                                handleAddTag(value)
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a tag" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {validTags.map((tag) => (
                                                <SelectItem key={tag} value={tag}>
                                                    {tag}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <Input
                                    placeholder="New tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                />
                                <Button type="button" onClick={() => handleAddTag(newTag)}>Add Tag</Button>
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
                            <Label htmlFor="description">Description (applies to all uploaded images)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your images..."
                            />
                        </div>
                        <Button type="submit" disabled={!files || uploading}>
                            {uploading ? 'Uploading...' : 'Upload Images'}
                        </Button>
                    </form>
                    {uploading && (
                        <div className="space-y-2">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-gray-600">Uploading... {Math.round(uploadProgress)}% complete</p>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="manage">
                    <ImageManagementTable />
                </TabsContent>
            </Tabs>
            <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
    )
}

