import { useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/router";

export function useGoogleOneTap(){
    const {user, login, loading} = useAuth();
    const router = useRouter();

    useEffect(()=>{
        // Don't show if user is already logged in
        if(user || loading){
            return;
        }

        // Check if Google SDK is loaded
        if(!window.google){
            console.error("Google SDK not loaded");
            return;
        }

        const handleGoogleLogin = async (response) => {
           
            try {
                const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential }),
                });

                const data = await res.json();
                if (!res.ok) {
                    console.error('Google login error:', err)
                    return;
                }

                login(data.token, data.user);
                const redirectPath = typeof router.query.redirect === 'string' ? router.query.redirect : router.asPath;
                router.push(redirectPath);
            } catch (err) {
                console.error('Google login error:', err);
            } 
        };

        // Initialize Google One Tap
        window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
        })

        // Show prompt
        window.google.accounts.id.prompt();
    },[user, loading]);
}