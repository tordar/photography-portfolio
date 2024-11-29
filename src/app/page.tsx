import Image from 'next/image'
import { list } from '@vercel/blob'
import Gallery from './components/Gallery'

export default async function Home() {
  const { blobs } = await list()
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">My Photography Portfolio</h1>
      <Gallery images={blobs} />
    </main>
  )
}

