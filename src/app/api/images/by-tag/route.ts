import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')

    if (!tag) {
        return NextResponse.json({ error: 'Tag parameter is required' }, { status: 400 })
    }

    try {
        console.log(`Fetching images with tag: ${tag}`)
        const { data, error } = await supabase
            .from('image_metadata')
            .select('*')
            .contains('tags', [tag])
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            throw error
        }

        console.log(`Fetched ${data?.length || 0} images with tag: ${tag}`)
        return NextResponse.json({ images: data })
    } catch (error) {
        console.error('Error fetching images by tag:', error)
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }
}

