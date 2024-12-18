import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { url } = await request.json()
        await del(url)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting blob:', error)
        return NextResponse.json({ error: 'Failed to delete blob' }, { status: 500 })
    }
}

