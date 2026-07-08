import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try {

        const { userId } = req.auth();
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized! Login Again!!!" })
        }

        const user = await clerkClient.users.getUser(userId)

        if (user.privateMetadata.role !== "admin") {
            return res.json({ success: false, message: "Not Authorized as Admin!" })
        }

        next();
    }
    catch (error) {
        console.log("Error occured during fetching the user metadata from clerk. Error : ", error)
        res.json({ success: false, message: error.message })
    }
}