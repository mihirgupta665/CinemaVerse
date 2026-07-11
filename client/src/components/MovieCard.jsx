import React from 'react'
import { StarIcon } from "lucide-react"
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext.jsx'

const MovieCard = ({ movie }) => {

    const { navigate, image_base_url } = useAppContext()

    if (!movie) return null

    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "N/A"

    const genres = (movie.genres || [])
        .slice(0, 2)
        .map((genre) => genre?.name || genre)
        .join(" | ")

    return (
        <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66'>
            <img
                onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }}
                src={image_base_url + movie.backdrop_path}
                alt={movie.title || "Movie"}
                className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer'
            />

            <p className='font-semibold mt-2 truncate'>{movie.title}</p>

            <p className='text-sm text-gray-400 mt-2'>
                {releaseYear} • {genres || "N/A"} • {timeFormat(movie.runtime || 0)}
            </p>

            <div className='flex items-center justify-between mt-4 pb-3'>
                <button onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }} className='px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>BuyTickets</button>
                <p className='flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1'>
                    <StarIcon className='w-4 h-4 text-primary fill-primary' />
                    {Number(movie.vote_average || 0).toFixed(1)}
                </p>
            </div>

        </div>
    )
}

export default MovieCard
