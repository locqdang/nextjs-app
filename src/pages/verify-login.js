import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

export default function VerifyLogin(){

    const router = useRouter();
    const [status, setStatus] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useAuth();

    //  Use effect to log the user in and redirect to homepage
    useEffect(() => {
        const {token} = router.query;

        if (!token) return;

        // Define verify token
        const verifyToken = async () =>{
            try{
                const response = await fetch('/api/auth/verify-login/',{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });
                const data = await response.json();

                // If verificaiton fails, set error, message and return
                if (!response.ok){
                    setStatus('error');
                    setMessage(data.error);
                    return;
                }

                // If succeed, set status and message
                setStatus('success');
                setMessage('Login successful. Redirecting...');

                // Log the user in
                login(data.token, data.user)

                // Redirect to homepage in 1 second
                const redirectPath = typeof router.query.redirect === 'string'
                    ? router.query.redirect
                    : '/'
                setTimeout(()=>{
                    router.push(
                        redirectPath
                    )
                }, 1000)
            } catch (e){
                setStatus('error');
                setMessage(e.message);
            }
        };

        // verify token
        verifyToken();

    }, [router.query])

    return (
        <>
            <div className="py-12 text-center">
                <h1>Logging in...</h1>
                {status !== '' && (<p>{status}</p>)}
                {message !== '' && (<p>{message}</p>)}
            </div>
        </>
    );
}