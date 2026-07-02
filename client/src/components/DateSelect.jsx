import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {

    const navigate = useNavigate()

    const [selected, setSelected] = useState(null)

    const onBookHandler = () => {
        if(!selected){
            return toast.error("Please Select a Date of Booking")
        }
        navigate(`/movies/${id}/${selected}`)
        scrollTo(0,0)
    }

    return (
        <div id="dateSelect" className='pt-30'>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
                <BlurCircle top="-100px" left="-100px"/>
                <BlurCircle top="100px" right="0px"/>
                <div>
                    <p className='text-lg font-semibold'>Choose Date</p>
                    <div className='flex items-center gap-6 text-sm mt-5'>
                        <ChevronLeftIcon width={28}/>
                        <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
                            {/* what does Object.keys do */}
                            {/* Object.keys returns an array of all the key of the object */}
                            {Object.keys(dateTime).map((date) => (
                                <button onClick={() => setSelected(date)} key={date} className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-primary text-white" : "border border-primary/70"} `}>
                                    <span>{new Date(date).getDate()}</span>
                                    {/* format in US format string for date and show the month only in short form too */}
                                    <span>{new Date(date).toLocaleDateString("en-US", {month: "short"})}</span>
                                </button>
                            ))}
                        </span>
                        <ChevronRightIcon width={28}/>
                    </div>
                </div>
                <button onClick={onBookHandler}  className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer">Book Now</button>
            </div>
        </div>
    )
}

export default DateSelect
