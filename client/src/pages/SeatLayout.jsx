import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from "lucide-react"
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { toast } from "react-toastify"
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {

    const { axios, navigate, user, getToken, redirectToLogin } = useAppContext()

    const { id, date } = useParams()

    const [selectedSeats, setSelectedSeats] = useState([])
    const [selectedTime, setSelectedTime] = useState(null)
    const [show, setShow] = useState(null)
    const [occupiedSeats, setOccupiedSeats] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUnavailable, setIsUnavailable] = useState(false)

    const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

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
                toast.error(data.message || "This show is no longer available.")
            }


        }
        catch (error) {
            setShow(null)
            setIsUnavailable(true)
            console.log("Error Occured while reaching to API to get all the show data for the specified Movies", error)
        }
        finally {
            setIsLoading(false)
        }

    }

    const handleSeatClick = (seatId) => {

        if (!selectedTime) {
            return toast.error("Please Select a Time to Proceed")
        }

        if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
            return toast.warn("You can only select 5 Seats")
        }

        if (occupiedSeats.includes(seatId)) {
            return toast.error(`${seatId} seat is already reserved`)
        }


        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])

    }

    const getOccupiedSeats = async () => {
        try {

            const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
            if (data.success) {
                setOccupiedSeats(data.occupiedSeats)
            }
            else {
                toast.error(data.message)
            }

        }
        catch (error) {
            console.log("Error occured while reaching to the API to get all occupied seats/ Error : ", error)
        }
    }


    const bookTickets = async () => {
        try {

            if (!user) {
                redirectToLogin()
                return
            }

            if (!selectedTime || !selectedSeats.length) {
                return toast.error("Please Select Seats to Proceed")
            }

            const { data } = await axios.post("/api/booking/create", { showId: selectedTime.showId, selectedSeats }, { headers: { Authorization: `Bearer ${await getToken()}` } })

            if (data.success) {
                window.location.href = data.url
                toast.loading("Redirecting to Stripe Checkout...");
            }
            else {
                toast.error(data.message)
            }

        }
        catch (error) {
            console.log("Error occured while reaching the API for booking of tickets for the Show. Error : ", error)
        }
    }


    useEffect(() => {
        getShow()
    }, [id, date, user])

    useEffect(() => {
        if (selectedTime) {
            getOccupiedSeats()
        }
    }, [user, id, date, selectedTime])

    const availableTimes = show?.dateTime?.[date] || []

    const renderSeats = (row, count = 9) => (
        <div key={row} className="flex gap-2 mt-2">
            <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                        <button key={seatId} onClick={() =>
                            handleSeatClick(seatId)}
                            className={`h-8 w-8 aspect-square rounded border border-primary/60 cursor-pointer 
                            ${selectedSeats.includes(seatId) && "bg-primary text-white"}
                            ${occupiedSeats.includes(seatId) && "opacity-50"}
                            `}>
                            {seatId}
                        </button>
                    );
                })}
            </div>
        </div>
    )

    if (isLoading) {
        return <Loading />
    }

    if (isUnavailable || !show?.movie || !availableTimes.length) {
        return (
            <div className='px-6 md:px-16 lg:px-40 py-30 md:pt-50 min-h-[70vh]'>
                <div className='max-w-3xl mx-auto relative'>
                    <BlurCircle top="-100px" left='-100px' />
                    <div className='border border-primary/20 bg-primary/8 rounded-2xl p-8'>
                        <h1 className='text-3xl font-semibold'>Show unavailable</h1>
                        <p className='text-gray-400 mt-3'>This show was removed or no timings are available for the selected date.</p>
                        <button onClick={() => { navigate("/movies"); scrollTo(0, 0) }} className='mt-6 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Back to Movies</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
            <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-32">
                <p className='text-lg font-semibold px-6'>Available Timings</p>
                <div className='mt-5 flex flex-col gap-2 space-y-1'>
                    {availableTimes.map((item) => (
                        <div key={item.showId} onClick={() => setSelectedTime(item)} className={`flex items-center gap-2 mx-auto px-6 py-2 w-40 cursor-pointer transition border border-primary-dull border rounded-full ${selectedTime?.showId === item.showId ? "bg-primary text-white" : "hover:bg-primary/20"} `}>
                            <ClockIcon className='w-4 h-4' />
                            <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>

                <BlurCircle top="-100px" left='-100px' />
                <BlurCircle bottom="0" right='0' />

                <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>
                <img src={assets.screenImage} alt="Screen" />
                <p className='text-gray-100 text-sm mb-6'>SCREEN SIDE</p>

                <div className='flex flex-col items-center mt-10 text-sm text-gray-300'>

                    <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                        {groupRows[0].map(row => renderSeats(row))}
                    </div>

                    <div className='grid grid-cols-2 gap-11'>
                        {groupRows.slice(1).map((group, idx) => (
                            <div key={idx}>
                                {group.map(row => renderSeats(row))}
                            </div>
                        ))}
                    </div>

                </div>

                <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                    Proceed to Checkout
                    <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
                </button>

            </div>
        </div>
    )

}

export default SeatLayout
