import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/auth-options'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { blob_url, blob_pathname, tags, description } = await request.json()

        const { error } = await supabase
            .from('image_metadata')
            .insert({
                blob_url,
                blob_pathname,
                tags,
                description
            })

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error storing metadata:', error)
        return NextResponse.json({ error: 'Failed to store metadata' }, { status: 500 })
    }
}

