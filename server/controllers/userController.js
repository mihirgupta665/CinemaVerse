import Booking from "../models/Booking.js";

// API Controller function to get the User Bookings
export const getUserBookings = async (req, res) => {
    try {

        const user = req.auth().userId;

        const bookings = await Booking.find({ user }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({createdAt: -1})

        res.json({success:true, bookings})

    }
    catch (error) {

        console.log("Error occured during fetching the all bookings of the user from the database. Error : ",error)
        res.json({success:false, message:error.message})


    }
}