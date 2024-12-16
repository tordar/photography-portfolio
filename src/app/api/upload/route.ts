import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'
import { supabase } from '@/lib/supabase'

export const config = {
  api: {
    bodyParser: false,
  },
}

interface Metadata {
  tags: string[];
  description: string;
}

export async function POST(request: Request) {
  console.log('Upload request received')

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    console.log('Checking authentication')
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('Authentication successful')

    console.log('Parsing form data')
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const tags = formData.get('tags') as string
    const description = formData.get('description') as string

    if (!file) {
      console.log('No file provided in the request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`File details: name=${file.name}, size=${file.size}, type=${file.type}`)
    console.log(`Metadata: tags=${tags}, description=${description}`)

    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log(`Starting upload of ${uniqueFilename}`)
    const uploadStartTime = Date.now()

    console.log('Initiating put operation')
    const metadata: Metadata = {
      tags: tags.split(',').map(tag => tag.trim()),
      description: description
    }
    try {
      const blob = await put(uniqueFilename, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      console.log('Put operation completed successfully')

      // Store metadata in Supabase
      const { error } = await supabase
          .from('image_metadata')
          .insert({
            blob_url: blob.url,
            blob_pathname: blob.pathname,
            tags: metadata.tags,
            description: metadata.description
          })

      if (error) {
        console.error('Error storing metadata in Supabase:', error)
        throw error
      }

      console.log('Metadata stored in Supabase successfully')

      const uploadDuration = Date.now() - uploadStartTime
      console.log(`Upload successful: url=${blob.url}, pathname=${blob.pathname}, duration=${uploadDuration}ms`)

      return NextResponse.json({
        success: true,
        url: blob.url,
        pathname: blob.pathname,
        duration: uploadDuration,
        metadata: metadata
      })

    } catch (putError) {
      console.error('Error during put operation or metadata storage:', putError)
      return NextResponse.json({
        error: 'Upload failed',
        details: putError instanceof Error ? putError.message : 'Unknown error during put operation or metadata storage'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

