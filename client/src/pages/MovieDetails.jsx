import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react"
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const MovieDetails = () => {

    const { navigate, axios, user, getToken, shows, image_base_url, fetchFavoriteMovies, favoriteMovies, redirectToLogin } = useAppContext()

    const { id } = useParams()
    const [show, setShow] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUnavailable, setIsUnavailable] = useState(false)

    const getShow = async () => {

        try {

            setIsLoading(true)
            setIsUnavailable(false)

            const { data } = await axios.get(`/api/show/${id}`)
            if (data.success && data.movie) {
                setShow(data)
            }
            else {
                setShow(null)
                setIsUnavailable(true)
                toast.error(data.message || "This movie is no longer available.")
            }

        }
        catch (error) {
            setShow(null)
            setIsUnavailable(true)
            console.log("Error occured while reaching to API to get the show and movie data from the backend. Error : ", error)
        }
        finally {
            setIsLoading(false)
        }

    }

    const handleFavorite = async () => {
        try {

            if (!user) {
                redirectToLogin()
                return
            }

            const { data } = await axios.post("/api/user/update-favorite", { movieId: id }, { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                fetchFavoriteMovies()
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }

        }
        catch (error) {

            console.log("Error occured while reaching to the API to update the favorites. Error : ", error)

        }
    }

    useEffect(() => {
        getShow()
    }, [id])

    useEffect(() => {
        if (user) {
            fetchFavoriteMovies()
        }
    }, [user, id])

    if (isLoading) {
        return <Loading />
    }

    if (isUnavailable || !show?.movie) {
        return (
            <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50 min-h-[70vh]'>
                <div className='max-w-3xl mx-auto relative'>
                    <BlurCircle top="-100px" left="-100px" />
                    <div className='border border-primary/20 bg-primary/8 rounded-2xl p-8'>
                        <h1 className='text-3xl font-semibold'>Movie unavailable</h1>
                        <p className='text-gray-400 mt-3'>This movie or its shows were removed, so this page can no longer be displayed.</p>
                        <button onClick={() => { navigate("/movies"); scrollTo(0, 0) }} className='mt-6 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Back to Movies</button>
                    </div>
                </div>
            </div>
        )
    }

    const movie = show.movie
    const relatedMovies = (shows || []).filter((item) => item && item._id !== id).slice(0, 4)
    const showDates = Object.keys(show.dateTime || {})

    return (
        <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>

            <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

                <img src={image_base_url + movie.poster_path} alt={movie.title} className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />

                <div className='relative flex flex-col gap-3'>
                    <BlurCircle top="-100px" left="-100px" />

                    <p className='text-primary'>{(movie.original_language || "N/A").toUpperCase()}</p>
                    <h1 className="text-4xl font-semibold max-w-96 text-balance">{movie.title}</h1>

                    <div className='flex items-center gap-2 text-gray-300'>
                        <StarIcon className='w-5 h-5 text-primary fill-primary' />
                        {Number(movie.vote_average || 0).toFixed(1)} User Rating
                    </div>

                    <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{movie.overview}</p>

                    <p>
                        {timeFormat(movie.runtime || 0)} • {(movie.genres || []).map((genre) => genre?.name || genre).join(", ") || "N/A"} • {movie.release_date?.split("-")[0] || "N/A"}
                    </p>

                    <div className='flex items-center flex-wrap gap-4 mt-4'>
                        <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95'>
                            <PlayCircleIcon className='w-5 h-5' />
                            Watch Trailer
                        </button>
                        {showDates.length > 0 && <a href="#dateSelect" className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95'>Buy Tickets</a>}
                        <button onClick={handleFavorite} className='bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
                            <Heart className={`w-5 h-5 ${favoriteMovies.find(movie => movie._id === id) ? "fill-primary text-primary" : ""}`} />
                        </button>
                    </div>

                </div>

            </div>

            <p className='text-lg font-medium mt-20'>Movies Cast</p>
            <div className='overflow-x-auto no-scrollbar mt-8 pb-4'>
                <div className='flex items-center gap-4 w-max px-4'>
                    {(movie.casts || []).slice(0, 12).map((cast, index) => (
                        <div key={index} className='flex flex-col items-center text-center'>
                            <img src={image_base_url + cast.profile_path} alt={cast.name} className='rounded-full h-20 md:h-20 aspect-square object-cover' />
                            <p className='font-medium text-xm mt-3'>{cast.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {showDates.length > 0 && <DateSelect dateTime={show.dateTime} id={id} />}

            <p className='text-lg font-medium mt-20 mb-20'>You May Also Like </p>
            <div className='flex flex-wrap max-sm:justify-center gap-8'>

                {relatedMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                ))}

            </div>

            <div className='flex justify-center mt-20'>
                <button onClick={() => { navigate("/movies"); scrollTo(0, 0) }} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show More</button>
            </div>

        </div>
    )
}

export default MovieDetails
