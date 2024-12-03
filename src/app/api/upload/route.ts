import { NextResponse } from 'next/server'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  },
}

export async function POST(request: Request) {
  console.log('Upload request received')

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    // Get the abort signal from the request
    const signal = request.signal;
    signal.addEventListener('abort', () => {
      console.log('Request was aborted by the client');
    });

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

    const response = await fetch(`https://blob.vercel-storage.com/store/${process.env.BLOB_STORE_ID}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': file.type,
        'x-content-type': file.type,
      },
      body: file,
      signal, // Pass through the abort signal
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    return NextResponse.json({
      success: true,
      url: result.url,
      pathname: result.pathname
    });

  } catch (error: unknown) {
    console.error('Upload error:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Upload cancelled by client' }, { status: 499 })
    }
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

