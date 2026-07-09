import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon, Grid2X2Plus } from "lucide-react"
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import { toast } from "react-toastify"
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {

    const { axios, navigate, user, getToken } = useAppContext()

    const { id, date } = useParams()

    const [selectedSeats, setSelectedSeats] = useState([])
    const [selectedTime, setSelectedTime] = useState(null)
    const [show, setShow] = useState(null)
    const [occupiedSeats, setOccupiedSeats] = useState([])

    const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

    const getShow = async () => {

        try {

            const { data } = await axios.get(`/api/show/${id}`)
            if (data.success) {
                setShow(data)
            }
            else {
                toast.error(data.message)
            }


        }
        catch (error) {
            console.log("Error Occured while reaching to API to get all the show data for the specified Movies");
        }

    }

    const handleSeatClick = (seatId) => {

        if (!selectedTime) {
            return toast.error("Please Select a Time to Proceed")
        }

        if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
            return toast.warn("You can only select 5 Seats")
        }
        
        if(occupiedSeats.includes(seatId)){
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
        
            if(!user){
                return toast.error("Please login to proceed")
            }

            if(!selectedTime || !selectedSeats.length){
                return toast.error("Please Select Seats to Proceed")
            }

            const {data} = await axios.post("/api/booking/create", { showId : selectedTime.showId, selectedSeats }, { headers: {Authorization : `Bearer ${await getToken()}` } })

            if(data.success){
                navigate("/my-bookings")
                toast.success(data.message)
            }
            else{
                toast.error(data.message)
            }

        }
        catch (error) {
            console.log("Error occured while reaching the API for booking of tickets for the Show. Error : ",error)
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


    return show
        ? (
            <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
                {/* Available Timings */}
                <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-32">
                    <p className='text-lg font-semibold px-6'>Available Timings</p>
                    <div className='mt-5 flex flex-col gap-2 space-y-1'>
                        {show.dateTime[date].map((item) => (
                            <div key={item.time} onClick={() => setSelectedTime(item)} className={`flex items-center gap-2 mx-auto px-6 py-2 w-40 cursor-pointer transition border border-primary-dull border rounded-full ${selectedTime?.time === item.time ? "bg-primary text-white" : "hover:bg-primary/20"} `}>
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

                    <button onClick={() => { navigate("/my-bookings"); scrollTo(0, 0) }} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
                        Proceed to Checkout
                        <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
                    </button>

                </div>
            </div>
        )
        : (
            <Loading />
        )

}

export default SeatLayout