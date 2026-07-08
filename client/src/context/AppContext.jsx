import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ children }) => {

    const { user } = useUser()
    const { getToken } = useAuth()
    const location = useLocation()

    const navigate = useNavigate()

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])


    const fetchIsAdmin = async () => {

        try {

            const { data } = axios.get("/api/admin/is-admin", { headers: { Authorization: `Bearer ${await getToken()}` } })
            setIsAdmin(data.isAdmin)

            if(!data.isAdmin && location.pathname.startsWith("/admin") ){
                toast.warn("You Are not Authorized as Admin!")
                navigate("/")
            }

        }
        catch(error) {
            console.log("Error Occured while fetching the user admin authorization from backend and clerk. Error : ",error)
        }
    }

    useEffect(() => {
        if(user){
            fetchIsAdmin()
        }
    }, [user])



    const fetchShows = async () => {
        try {
        
            const {data} = await axios.get("/api/admin/all-shows")
            if(data.success){
                setShows(data.shows)
            }

        } 
        catch(error) {

        }
    }



    const value = {
        axios,
        isAdmin, setIsAdmin,
        shows, setShows,
        favoriteMovies, setFavoriteMovies,


    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)