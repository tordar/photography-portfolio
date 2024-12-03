import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Testing Blob connection...');
        console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
        
        // Try to list blobs (this requires less permissions than upload)
        const { blobs } = await list();
        
        console.log('Successfully connected to Blob storage');
        console.log('Found', blobs.length, 'files');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Blob storage connection successful',
            fileCount: blobs.length 
        });
    } catch (error) {
        console.error('Blob connection test failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
} 