import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('image_metadata')
            .select('tags')

        if (error) {
            throw error
        }

        const uniqueTags = Array.from(new Set(data.flatMap(item => item.tags)))
        return NextResponse.json({ tags: uniqueTags })
    } catch (error) {
        console.error('Error fetching tags:', error)
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }
}

