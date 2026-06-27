import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request })
    
    const supabase = createServerClient (
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                }, 
                setAll(cookiesToSet){
                    cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )
    //refresh session if access token is expired - req for server components
    const { data:{ user }  } = await supabase.auth.getUser()

    //protect routes that require authentication
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return response
} 

export const config ={
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}