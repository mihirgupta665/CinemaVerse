import Booking from "../models/Booking.js";
import Show from "../models/Show.js"


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
        console.log("Error occured during finding the show and cheking the selecgted seat is in the ocuupied seat list in database. Error : ", error);
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

        res.json({success: true, message: "Booked Successfully"})

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
        const showData = await Show.findById(showData)

        const occupiedSeats = Object.keys(showData.occupiedSeats)  // returns array of string for seats

        res.json({success:true, occupiedSeats})

    }
    catch (error) {
        console.log("Error occured during fetching the occupied seat for the specified show. Error : ",error)
        res.json({success:false, message:error.message})
    }

}