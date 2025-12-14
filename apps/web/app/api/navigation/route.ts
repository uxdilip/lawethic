import { NextResponse } from 'next/server'
import { getNavigationData } from '@/lib/navigation'

export async function GET() {
    try {
        const navData = await getNavigationData()
        return NextResponse.json(navData)
    } catch (error) {
        console.error('Error fetching navigation data:', error)
        return NextResponse.json({ parentCategories: [] })
    }
}
