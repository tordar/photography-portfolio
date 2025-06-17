import { createClient } from '@supabase/supabase-js'
import Gallery from './components/Gallery'
import Navigation from './components/Navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function Home() {
    const { data: images } = await supabase
        .from('image_metadata')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <>
            <Navigation />
            <main className="w-3/4 mx-auto px-4 py-12">
                <Gallery images={images || []} />
            </main>
        </>
    )
}

