import React, { useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'
import { SignIn } from '@clerk/clerk-react'

const Favorite = () => {

    const { favoriteMovies, user, fetchFavoriteMovies } = useAppContext()

    if (!user) {
        return (
            <div className="flex mt-5 items-center justify-center min-h-screen">
                <SignIn fallbackRedirectUrl="/favorite" />
            </div>
        );
    }

    let c=0;

    useEffect(() => {

        if(user && c){
            fetchFavoriteMovies()
        }
        c++;

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
            </div>
        )
}

export default Favorite