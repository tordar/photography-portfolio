import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'

export async function POST(request: Request): Promise<NextResponse> {
    console.log('Blob upload request received')

    const session = await getServerSession(authOptions)
    if (!session) {
        console.log('Unauthorized access attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json() as HandleUploadBody

        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
              
                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                }
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                
                console.log('Upload completed:', blob, tokenPayload)
            },
        })

        return NextResponse.json(jsonResponse)
    } catch (error) {
        console.error('Error handling upload:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error occurred' },
            { status: 500 }
        )
    }
}

