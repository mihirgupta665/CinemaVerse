import Booking from "../models/Booking.js";
import Show from "../models/Show.js"

import stripe from "stripe"


// Function to check the Availablility of the selected seat for a specific movie
const checkSeatAvailability = async (showId, selectedSeats) => {

    try {
        
        const showData = await Show.findById(showId)
        if(!showData){
            return false
        }

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken
 
    }
    catch (error) {
        console.log("Error occured during finding the show and checking the selected seat is in the occupied seat list in database. Error : ", error);
        return false;
    }
}


// Controller function to create a booking for the selected seats and updating databse for show's seats.
export const createBooking = async (req, res) => {

    try {
        
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body
        const { origin } = req.headers; 

        // Checign seat availability for the selected show and selected seats
        const isAvailable = await checkSeatAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success:false, message: "Selected seats are not available."})
        }

        // Get the show details
        const showData = await Show.findById(showId).populate("movie");

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        // reserving the newly selected seats in the shows database 
        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId
        })

        showData.markModified("occupiedSeats")

        await showData.save();


        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
        }]

        // what is origin what is /loading/mybooking why in cancel we did not used loading as direct /my-booking
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: "payment",
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now()/1000) + 30*60, // expires in 30 minutes but how
        })

        booking.paymentLink = session.url
        await booking.save()

        // res.json({success: true, message: "Booked Successfully"})
        res.json({success: true, url : session.url})

    }
    catch (error) {
        console.log("Error occured during creation of booking data and reserving the seats in the show database.")
        res.json({success: false, message:error.message})
    }
}


// Controller function to get the occupied seats
export const getOccupiedSeats = async (req, res) => {

    try {

        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)  // returns array of string for seats

        res.json({success:true, occupiedSeats})

    }
    catch (error) {
        console.log("Error occured during fetching the occupied seat for the specified show. Error : ",error)
        res.json({success:false, message:error.message})
    }

}