import { NextResponse } from 'next/server'
import { put, PutBlobResult } from '@vercel/blob'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  console.log('Upload request received')

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
    const file = formData.get('file') as File
    if (!file) {
      console.log('No file provided in the request')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`File details: name=${file.name}, size=${file.size}, type=${file.type}`)

    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    console.log(`Starting upload of ${uniqueFilename}`)
    const uploadStartTime = Date.now()

    console.log('Initiating put operation')
    let blob: PutBlobResult
    try {
      blob = await put(uniqueFilename, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      console.log('Put operation completed successfully')
    } catch (putError) {
      console.error('Error during put operation:', putError)
      return NextResponse.json({ error: 'Upload failed', details: putError instanceof Error ? putError.message : 'Unknown error during put operation' }, { status: 500 })
    }

    const uploadDuration = Date.now() - uploadStartTime
    console.log(`Upload successful: url=${blob.url}, pathname=${blob.pathname}, duration=${uploadDuration}ms`)

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      duration: uploadDuration,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

