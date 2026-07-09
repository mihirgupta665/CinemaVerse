import Booking from "../models/Booking.js";
import { clerkClient } from "@clerk/express";
import Movie from "../models/Movie.js";

// API Controller function to get the User Bookings
export const getUserBookings = async (req, res) => {
    try {

        const user = req.auth().userId;

        const bookings = await Booking.find({ user })
            .populate({
                path: "show",
                populate: { path: "movie" }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });

    }
    catch (error) {

        console.log("Error occured during fetching the all bookings of the user from the database. Error : ", error);
        res.json({ success: false, message: error.message });

    }
};


// API controller function to Add or Remove Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {

    try {

        const { movieId } = req.body;
        const { userId } = req.auth();

        let user;
        const MAX_RETRIES = 5;

        // Retry fetching Clerk user
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                user = await clerkClient.users.getUser(userId);
                break;
            }
            catch (error) {
                console.log(`Clerk getUser attempt ${attempt} failed.`);

                if (attempt === MAX_RETRIES) throw error;

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }

        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        }
        else {
            user.privateMetadata.favorites =
                user.privateMetadata.favorites.filter(item => item !== movieId);
        }

        // Retry updating Clerk metadata
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await clerkClient.users.updateUserMetadata(userId, {
                    privateMetadata: user.privateMetadata
                });
                break;
            }
            catch (error) {
                console.log(`Clerk updateUserMetadata attempt ${attempt} failed.`);

                if (attempt === MAX_RETRIES) throw error;

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        res.json({
            success: true,
            message: "Updated MovieList of Favorites!"
        });

    }
    catch (error) {

        console.log(
            "Error occured while updating the private metadata of user in Clerk Database. Error :",
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }
};


// API controller function to get the favorites movies list
export const getFavorites = async (req, res) => {

    try {

        const { userId } = req.auth();

        let user;
        const MAX_RETRIES = 5;

        // Retry fetching Clerk user
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                user = await clerkClient.users.getUser(userId);
                break;
            }
            catch (error) {
                console.log(`Clerk getUser attempt ${attempt} failed.`);

                if (attempt === MAX_RETRIES) throw error;

                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        const favorites = user.privateMetadata.favorites;

        if (!favorites || favorites.length === 0) {
            return res.json({
                success: false,
                message: "No Movie in Favorites List.\nAdd your first movie as Favorite!"
            });
        }

        const movies = await Movie.find({
            _id: { $in: favorites }
        });

        res.json({
            success: true,
            movies
        });

    }
    catch (error) {

        console.log(
            "Error occured during getting the favorites movie list from user private metadata from Clerk database. Error : ",
            error
        );

        res.json({
            success: false,
            message: error.message
        });

    }

};