import React, { useEffect } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'

const Movies = () => {

    const { user, shows, fetchShows } = useAppContext()

    useEffect(() => {
        if(user){
            fetchShows()
        }
    }, [user])

    return shows.length > 0 ? (
        <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

            <BlurCircle top="150px" left="0px" />
            <BlurCircle bottom="50px" right="0px" />

            <h1 className='text-lg font-medium my-4'>Now Showing</h1>
            <div className='flex flex-wrap max-sm:justify-center gap-8' >
                {shows.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                ))}
            </div>

        </div>
    )
        : (
            <div className='flex flex-col items-center justify-center h-screen'>
                <h1 className='text-3xl font-bold text-center'>Sorry! No Movies Available</h1>
            </div>
        )
}

export default Movies