'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { supabase } from '@/lib/supabase'

export default function Navigation() {
    const [tags, setTags] = useState<string[]>([])
    const pathname = usePathname()

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data, error } = await supabase
                    .from('image_metadata')
                    .select('tags')

                if (error) {
                    throw error
                }

                const uniqueTags = Array.from(new Set(data?.flatMap(item => item.tags || [])))
                setTags(uniqueTags)
            } catch (error) {
                console.error('Error fetching tags:', error)
            }
        }

        fetchTags()
    }, [])

    return (
        <nav className="border-b">
            <div className="w-full px-4">
                <div className="py-8">
                    <Link href="/" className="text-2xl font-bold block mb-6">
                        <span className="font-light">Photography</span>{" "}
                        <span className="font-bold">Tordar Tømmervik</span>
                    </Link>
                    <div className="flex flex-wrap justify-center gap-14 text-sm">
                        <Link
                            href="/"
                            className={cn(
                                "hover:text-primary transition-colors",
                                pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
                            )}
                        >
                            All
                        </Link>
                        {tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/category/${encodeURIComponent(tag)}`}
                                className={cn(
                                    "hover:text-primary transition-colors",
                                    pathname === `/category/${encodeURIComponent(tag)}`
                                        ? "text-primary font-medium "
                                        : "text-muted-foreground"
                                )}
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    )
}

