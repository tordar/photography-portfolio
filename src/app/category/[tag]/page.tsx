import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Gallery from '@/app/components/Gallery'
import Navigation from '@/app/components/Navigation'
import { notFound } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function generateStaticParams() {
    const { data: tags } = await supabase
        .from('image_metadata')
        .select('tags')
        .not('tags', 'is', null)

    if (!tags) return []

    const uniqueTags = Array.from(new Set(tags.flatMap(item => item.tags)))
    return uniqueTags.map(tag => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({
                                           params
                                       }: {
    params: Promise<{ tag: string }>
}): Promise<Metadata> {
    const { tag } = await params
    const decodedTag = decodeURIComponent(tag)
    return {
        title: `${decodedTag} - Photography Portfolio`,
        description: `View our collection of ${decodedTag} photographs`,
    }
}

export default async function CategoryPage({
                                               params
                                           }: {
    params: Promise<{ tag: string }>
}) {
    const { tag } = await params
    const decodedTag = decodeURIComponent(tag)

    const { data: images, error } = await supabase
        .from('image_metadata')
        .select('*')
        .contains('tags', [decodedTag])

    if (error || !images || images.length === 0) {
        notFound()
    }

    return (
        <>
            <Navigation />
            <main className="container mx-auto px-4 py-12">
                <Gallery images={images} />
            </main>
        </>
    )
}

