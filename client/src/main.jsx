import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from "react-router-dom"
import { ClerkProvider } from "@clerk/clerk-react"
import { AppProvider } from './context/AppContext.jsx'


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Self-invoking function to wake up backend immediately on load (helps bypass Render free tier sleep)
(function wakeUpBackend() {
    const apiBase = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
    fetch(`${apiBase}/`).catch(() => {});
})();

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')).render(
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
            <AppProvider>
                <App />
            </AppProvider>
        </BrowserRouter>
    </ClerkProvider>,
)
