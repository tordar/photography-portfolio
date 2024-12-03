import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'
import { NextResponse } from 'next/server'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
        uploadUrl: `https://blob.vercel-storage.com/store/${process.env.BLOB_STORE_ID}`,
        token: process.env.BLOB_READ_WRITE_TOKEN
    })
} 