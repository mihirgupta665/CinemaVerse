import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const Login = () => {

    const { user } = useAppContext()
    const location = useLocation()

    const searchParams = new URLSearchParams(location.search)
    const redirectTo = searchParams.get("redirect") || "/"

    useEffect(() => {
        scrollTo(0, 0)
    }, [])

    if (user) {
        return <Navigate to={redirectTo} replace />
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24">
            <SignIn
                fallbackRedirectUrl={redirectTo}
                signUpFallbackRedirectUrl={redirectTo}
            />
        </div>
    )
}

export default Login
