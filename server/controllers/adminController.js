import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";

const filterShowsWithMovies = async (shows) => {
    const orphanShowIds = shows
        .filter((show) => !show.movie)
        .map((show) => show._id);

    if (orphanShowIds.length) {
        await Show.deleteMany({ _id: { $in: orphanShowIds } });
    }

    return shows.filter((show) => show.movie);
};

const filterBookingsWithMovies = (bookings) =>
    bookings.filter((booking) => booking.user && booking.show && booking.show.movie);

// Controller function to check if user is Admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true })
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {

        const [bookings, shows, totalUser] = await Promise.all([

            Booking.find({ isPaid: true }),

            Show.find({
                showDateTime: { $gte: new Date() }
            })
                .populate("movie")
                .sort({ showDateTime: -1 }),

            User.countDocuments()

        ]);

        const activeShows = await filterShowsWithMovies(shows);

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce(
                (acc, booking) => acc + booking.amount,
                0
            ),
            activeShows,
            totalUser
        };

        res.json({ success: true, dashboardData });

    } catch (error) {

        console.log(
            "Error occured during fetching the data of Booking, Shows and total user count from the database. Error:",
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};


// API controller function to get all the shows for the admin dashboard
export const getAllShows = async (req, res) => {

    try {

        const shows = await filterShowsWithMovies(
            await Show.find({ showDateTime: { $gte: new Date() } }).populate("movie").sort({ showDateTime: -1 })
        );
        res.json({ success: true, shows })

    }
    catch (error) {
        console.log("Error Occured during fetching of all the shows from the admin dashboard. Error : ", error)
        res.json({ success: false, message: error.message })
    }
}


// API to get all bookings
export const getAllBookings = async (req, res) => {

    try {

        const bookings = filterBookingsWithMovies(await Booking.find({}).populate("user").populate({
            path: "show",
            populate: { path: "movie" },
        }).sort({ createdAt: -1 }))

        res.json({ success: true, bookings })

    }
    catch (error) {
        console.log("Error occured during fetching all the bookings data for the database. Error : ",error)
        res.json({success:false, message:error.message})
    }

}
