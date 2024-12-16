import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'
import { put } from '@vercel/blob'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const clientToken = await put('', new Blob([]), { access: 'public' })
        return NextResponse.json({ clientToken })
    } catch (error) {
        console.error('Error generating client token:', error)
        return NextResponse.json({ error: 'Failed to generate client token' }, { status: 500 })
    }
}

