import React, { useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import { Navigate } from 'react-router-dom'

const Favorite = () => {

    const { favoriteMovies, user, fetchFavoriteMovies, navigate, location } = useAppContext()

    if (!user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search + location.hash)}`} replace />
    }

    // let c=0;

    useEffect(() => {

        if(user){
            fetchFavoriteMovies()
        }
        // c++;

    }, [user])

    return favoriteMovies.length > 0 ? (
        <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

            <BlurCircle top="150px" left="0px" />
            <BlurCircle bottom="50px" right="0px" />

            <h1 className='text-lg font-light my-4'>Your Favorite Movies</h1>
            <div className='flex flex-wrap max-sm:justify-center gap-8' >
                {favoriteMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                ))}
            </div>

        </div>
    )
        : (
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-3xl font-bold text-center'>Sorry! No Favorite Movies Available</h1>
                <h5 className='text-lg mt-4 font-bold text-center'>Lets Add your first movie to favorites list</h5>
                <button onClick={() => { navigate("/movies"); scrollTo(0, 0) }} className='mt-15 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Get a Favorite</button>
            </div>
        )
}

export default Favorite
