'use client'

import {useState, useEffect, useCallback} from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, X, Check } from 'lucide-react'
import Image from 'next/image'

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

export function ImageManagementTable() {
    const [images, setImages] = useState<ImageMetadata[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editedTags, setEditedTags] = useState<string>('')
    const [editedDescription, setEditedDescription] = useState<string>('')
    const { toast } = useToast()

    const fetchImages = useCallback(async () => {
        const { data, error } = await supabase
            .from('image_metadata')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching images:', error)
            toast({
                title: "Error",
                description: "Failed to fetch images",
                variant: "destructive",
            })
        } else {
            setImages(data || [])
        }
    }, [toast])

    useEffect(() => {
        fetchImages()
    }, [fetchImages])

    const handleEdit = (image: ImageMetadata) => {
        setEditingId(image.id)
        setEditedTags(image.tags.join(', '))
        setEditedDescription(image.description)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditedTags('')
        setEditedDescription('')
    }

    const handleSaveEdit = async (image: ImageMetadata) => {
        const { error } = await supabase
            .from('image_metadata')
            .update({
                tags: editedTags.split(',').map(tag => tag.trim()),
                description: editedDescription
            })
            .eq('id', image.id)

        if (error) {
            console.error('Error updating image:', error)
            toast({
                title: "Error",
                description: "Failed to update image",
                variant: "destructive",
            })
        } else {
            toast({
                title: "Success",
                description: "Image updated successfully",
            })
            fetchImages()
        }
        setEditingId(null)
    }

    const handleDelete = async (image: ImageMetadata) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                // Delete from Vercel Blob
                const blobResponse = await fetch('/api/delete-blob', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: image.blob_url }),
                })

                if (!blobResponse.ok) {
                    throw new Error('Failed to delete from Vercel Blob')
                }

                // Delete from Supabase
                const { error } = await supabase
                    .from('image_metadata')
                    .delete()
                    .eq('id', image.id)

                if (error) {
                    throw error
                }

                toast({
                    title: "Success",
                    description: "Image deleted successfully",
                })
                fetchImages()
            } catch (error) {
                console.error('Error deleting image:', error)
                toast({
                    title: "Error",
                    description: "Failed to delete image",
                    variant: "destructive",
                })
            }
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {images.map((image) => (
                        <TableRow key={image.id}>
                            <TableCell>
                                <Image
                                    src={image.blob_url}
                                    alt={image.description}
                                    width={100}
                                    height={100}
                                    objectFit="cover"
                                    className="rounded"
                                />
                            </TableCell>
                            <TableCell>
                                {editingId === image.id ? (
                                    <Input
                                        value={editedTags}
                                        onChange={(e) => setEditedTags(e.target.value)}
                                        placeholder="Enter tags, separated by commas"
                                    />
                                ) : (
                                    image.tags.join(', ')
                                )}
                            </TableCell>
                            <TableCell>
                                {editingId === image.id ? (
                                    <Input
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        placeholder="Enter description"
                                    />
                                ) : (
                                    image.description
                                )}
                            </TableCell>
                            <TableCell>
                                {image.width && image.height ? `${image.width}x${image.height}` : 'Unknown'}
                            </TableCell>
                            <TableCell>
                                {editingId === image.id ? (
                                    <div className="flex space-x-2">
                                        <Button onClick={() => handleSaveEdit(image)} size="sm">
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={handleCancelEdit} size="sm" variant="outline">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <Button onClick={() => handleEdit(image)} size="sm" variant="outline">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleDelete(image)} size="sm" variant="destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

