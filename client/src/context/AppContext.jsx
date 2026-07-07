import { useState, useContext, createContext } from "react";
import axios from "axios"

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL  

export const AppContext = createContext()

export const AppProvider = ({children}) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])

    const value = {
        axios,
        
    }
    useEffect

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)