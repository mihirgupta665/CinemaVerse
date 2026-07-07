import Booking from "../models/Booking"
import Show from "../models/Show";
import User from "../models/User";

// Controller function to check if user is Admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true })
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {

        const bookings = await Booking.find({ isPaid: true });

        const activeShows = await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie")

        const totalUser = await User.countDocuments();

        /*
        // use promiseAll
        const { bookings, activeShows, totalUser } = Promise.all([
            Booking.find({ isPaid: true }), 
            Show.find({ showDateTime: { $gte: new Date() } }).populate("movie"),
            User.countDocuments()
        ])
        */

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }


    }
    catch (error) {

    }
}
