import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'
import { supabase } from '@/lib/supabase'
import sharp from 'sharp'

export const config = {
    api: {
        bodyParser: false,
    },
}

const UPLOAD_TIMEOUT = 60000; // 60 seconds timeout

export async function POST(request: Request): Promise<NextResponse> {
    console.log('Blob upload request received')
    console.log('Request Content-Type:', request.headers.get('content-type'))

    const session = await getServerSession(authOptions)
    if (!session) {
        console.log('Unauthorized access attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        console.log('Parsing form data')
        const formData = await request.formData()
        const file = formData.get('file') as File
        const tagsString = formData.get('tags') as string
        const description = formData.get('description') as string

        if (!file) {
            console.log('No file provided')
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        console.log(`File received: ${file.name}, size: ${file.size} bytes`)

        const buffer = Buffer.from(await file.arrayBuffer())
        const sharpImage = sharp(buffer)
        const metadata = await sharpImage.metadata()

        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        console.log(`Generated unique filename: ${uniqueFilename}`)

        console.log('Initiating Vercel Blob upload')
        let blob
        try {
            const uploadStartTime = Date.now()
            const uploadPromise = put(uniqueFilename, file, {
                access: 'public',
            })

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
            )

            blob = await Promise.race([uploadPromise, timeoutPromise]) as Awaited<ReturnType<typeof put>>

            const uploadDuration = Date.now() - uploadStartTime
            console.log(`Vercel Blob upload completed in ${uploadDuration}ms`, blob)
        } catch (blobError) {
            console.error('Error during Vercel Blob upload:', blobError)
            return NextResponse.json({ error: 'Failed to upload to Vercel Blob', details: blobError instanceof Error ? blobError.message : String(blobError) }, { status: 500 })
        }

        console.log('Storing metadata in Supabase')
        const parsedTags = JSON.parse(tagsString || '[]')
        const { error } = await supabase
            .from('image_metadata')
            .insert({
                blob_url: blob.url,
                blob_pathname: blob.pathname,
                tags: parsedTags,
                description: description,
                width: metadata.width,
                height: metadata.height
            })

        if (error) {
            console.error('Error storing metadata in Supabase:', error)
            return NextResponse.json({ error: 'Failed to store metadata' }, { status: 500 })
        }

        console.log('Metadata stored successfully')

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
        })
    } catch (error) {
        console.error('Error in blob upload:', error)
        return NextResponse.json({ error: 'Failed to upload file', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

