import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon } from "lucide-react"
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { toast } from "react-toastify"

const SeatLayout = () => {

    const { id, date } = useParams()

    const navigate = useNavigate()

    const [selectedSeats, setSelectedSeats] = useState([])
    const [selectedTime, setSelectedTime] = useState(null)
    const [show, setShow] = useState(null)

    const getShow = async () => {

        const show = dummyShowsData.find((show) => show._id === id)
        if (show) {
            setShow({
                movie: show,
                dateTime: dummyDateTimeData
            })
        }

    }

    useEffect(() => {
        getShow()
    }, [id, date])

    const handleSeatClick = (seatId) => {

        if(!selectedTime){
            return toast.warn("Please Select a Time to Proceed")
        }

        if(!selectedSeats.includes(seatId) && selectedSeats.length > 4){
            return toast.error("Youc can only select 5 Seats")
        }

        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])

    }

    const renderSeats = (row, count = 9) => (
        <div key={row} className="flex gap-2 mt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                        <button key={seatId} onClick={ () => handleSeatClick(seatId) } className={`h-8 w-8 rounded border border-primary/60 cursor-pointer ${selectedSeats.includes(seatId) && "bg-primary text-white"}`}>
                            {seatId}
                        </button>
                    );
                })}
            </div>
        </div>
    )


    return show
        ? (
            <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
                {/* Available Timings */}
                <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
                    <p className='text-lg font-semibold px-6'>Available Timings</p>
                    <div className='mt-5 space-y-1'>
                        {show.dateTime[date].map((item) => (
                            <div key={item.time} onClick={() => setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"} `}>
                                <ClockIcon className='w-4 h-4' />
                                <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Seat Layout */}
                <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>

                    <BlurCircle top="-100px" left='-100px' />
                    <BlurCircle bottom="0" right='0' />

                    <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>
                    <img src={assets.screenImage} alt="Screen" />
                    <p className='text-gray-100 text-sm mb-6'>SCREEN SIDE</p>

                </div>
            </div>
        )
        : (
            <Loading />
        )

}

export default SeatLayout