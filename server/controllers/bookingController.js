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

export const createBooking = async (req, res) => {

    try {
        
        


    }
    catch (error) {
        
    }

}