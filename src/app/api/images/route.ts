import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    console.log('Entering GET function for /api/images')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
    console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
        console.log('Initializing Supabase client')
        const supabase = createClient(supabaseUrl, supabaseKey)

        console.log('Fetching images from Supabase...')
        const { data, error } = await supabase
            .from('image_metadata')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: 'Database query error' }, { status: 500 })
        }

        console.log(`Fetched ${data?.length || 0} images`)
        return NextResponse.json({ images: data })
    } catch (error) {
        console.error('Error fetching images:', error)
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }
}

