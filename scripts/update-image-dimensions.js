const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getImageDimensions(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const metadata = await sharp(Buffer.from(buffer)).metadata();
    return { width: metadata.width || 0, height: metadata.height || 0 };
}

async function updateImageDimensions() {
    const { data: images, error } = await supabase
        .from('image_metadata')
        .select('id, blob_url')
        .is('width', null);

    if (error) {
        console.error('Error fetching images:', error);
        return;
    }

    for (const image of images) {
        try {
            const { width, height } = await getImageDimensions(image.blob_url);
            const { error: updateError } = await supabase
                .from('image_metadata')
                .update({ width, height })
                .eq('id', image.id);

            if (updateError) {
                console.error(`Error updating image ${image.id}:`, updateError);
            } else {
                console.log(`Updated dimensions for image ${image.id}: ${width}x${height}`);
            }
        } catch (error) {
            console.error(`Error processing image ${image.id}:`, error);
        }
    }
}

updateImageDimensions().then(() => console.log('Finished updating image dimensions'));

