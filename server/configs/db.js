import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => console.log("MongoDB Database Connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/cinemaverse`);
    }
    catch (error) {
        console.log("Error Occured while Connecting to the MongoDB database. Error : ",error.message);
    }
}

export default connectDB;