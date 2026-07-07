import Booking from "../models/Booking.js";
import { clerkClient } from "@clerk/express"

// API Controller function to get the User Bookings
export const getUserBookings = async (req, res) => {
    try {

        const user = req.auth().userId;

        const bookings = await Booking.find({ user }).populate({
            path: "show",
            populate: { path: "movie" }
        }).sort({ createdAt: -1 })

        res.json({ success: true, bookings })

    }
    catch (error) {

        console.log("Error occured during fetching the all bookings of the user from the database. Error : ", error)
        res.json({ success: false, message: error.message })

    }
}


// API controller function to Add or Remove Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {

    try {

        const { movieId } = req.body

        const { userId } = req.auth()
        const user = await clerkClient.users.getUser(userId)

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = []
        }

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId)
        }
        else {
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter((item) => item !== movieId)
        }

        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata })

        res.json({ success: true, message: "Updated MovieList of Favorites!" })

    }
    catch (error) {

        console.log("Error occured while updating the private metadata of user in Clerk Database. Error :", error)
        res.json({ success: false, message: error.message })

    }
}


