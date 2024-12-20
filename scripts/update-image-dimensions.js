const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = "https://gjaacaogwfzgosjnpepk.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqYWFjYW9nd2Z6Z29zam5wZXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM5NDcxMiwiZXhwIjoyMDQ4OTcwNzEyfQ.rxw49LMdRMjgC1BwmSjnVzabnC8IiCyCe0SThbRYk0I"

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

