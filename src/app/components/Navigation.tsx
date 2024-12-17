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
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center py-8">
                    <Link href="/" className="text-2xl font-bold mb-6">
                        PHOTOGRAPHY PORTFOLIO
                    </Link>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
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
                                    pathname === `/category/${tag}` ? "text-primary font-medium" : "text-muted-foreground"
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

