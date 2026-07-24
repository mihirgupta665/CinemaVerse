import React, { useState, useEffect } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { PlayCircleIcon } from "lucide-react"
import { useAppContext } from '../context/AppContext'

const TrailerSection = () => {
    const { axios } = useAppContext()
    const [trailers, setTrailers] = useState(dummyTrailers)
    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

    useEffect(() => {
        const fetchTrailers = async () => {
            try {
                const { data } = await axios.get("/api/show/latest-trailers")
                if (data.success && data.trailers && data.trailers.length > 0) {
                    setTrailers(data.trailers)
                    setCurrentTrailer(data.trailers[0])
                }
            } catch (err) {
                console.error("Failed to load dynamic trailers, using fallbacks:", err)
            }
        }
        fetchTrailers()
    }, [axios])

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
            <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">Trailers</p>

            <div className="relative mt-6">
                <BlurCircle top="-100px" right="-100px" />
                <ReactPlayer url={currentTrailer?.videoUrl} src={currentTrailer?.videoUrl} controls={true} className="mx-auto max-w-full aspect-video" width="960px" height="540px" />
            </div>

            <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                {trailers.map((trailer, idx) => (
                    <div onClick={() => setCurrentTrailer(trailer) }  key={(trailer.image || '') + idx} className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer' >
                        <img src={trailer.image} alt="trailer" className='rounded-lg w-full h-full object-cover brightness-75' />
                        <PlayCircleIcon strokeWidth={1.6} className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2"/>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default TrailerSection
