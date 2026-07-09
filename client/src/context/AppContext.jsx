import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL
const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

export const AppContext = createContext()

export const AppProvider = ({ children }) => {

    const { user } = useUser()
    const { getToken } = useAuth()
    const location = useLocation()

    const navigate = useNavigate()

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMovies, setFavoriteMovies] = useState([])




    // Function to check that user is admin or not
    const fetchIsAdmin = async () => {

        try {

            const { data } = await axios.get("/api/admin/is-admin", { headers: { Authorization: `Bearer ${await getToken()}` } })
            // console.log("Data : ",data)
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith("/admin")) {
                toast.warn("You Are not Authorized as Admin!")
                navigate("/")
            }

        }
        catch (error) {
            console.log("Error Occured while fetching the user admin authorization from backend and clerk. Error : ", error)
        }
    }


    // Function to get all the shows for the user
    const fetchShows = async () => {
        try {

            const { data } = await axios.get("/api/show/all")
            if (data.success) {
                setShows(data.shows)
            }
            else {
                toast.error(data.message)
            }

        }
        catch (error) {
            console.log("Error occured while fetching all the shows from backend. Error : ", error);
        }
    }


    // Function to get all the favorites movies of the user
    const fetchFavoriteMovies = async () => {

        try {

            const { data } = await axios.get("/api/user/favorites", { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                setFavoriteMovies(data.movies)
            }
            else {
                if (data.message.includes("No Movie") && location.pathname.includes("favorite")) {
                    toast.error(data.message)
                }
                else if (data.message.includes("Error")) {
                    toast.error(data.message)
                }
            }


        }
        catch (error) {
            console.log("Error occured while fetching the favorites movies of the user. Error : ", error)
        }

    }



    useEffect(() => {
        fetchShows()
    }, [])

    useEffect(() => {
        if (user) {
            fetchIsAdmin()
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchFavoriteMovies()
        }
    }, [location, user])


    const value = {

        axios,
        navigate,

        image_base_url,

        user,
        getToken,
        location,

        isAdmin,
        fetchIsAdmin,

        shows,
        fetchShows,

        favoriteMovies,
        fetchFavoriteMovies,


    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)