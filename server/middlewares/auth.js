import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try {

        const auth = req.auth();
        const { userId, sessionClaims } = auth;
        if (!userId) {
            return res.json({ success: false, message: "Not Authorized! Login Again!!!" })
        }

        const roleFromClaims = sessionClaims?.privateMetadata?.role;

        if (roleFromClaims === "admin") {
            return next();
        }

        const user = await clerkClient.users.getUser(userId)

        if (user.privateMetadata.role !== "admin") {
            return res.json({ success: false, message: "Not Authorized as Admin!" })
        }

        return next();
    }
    catch (error) {
        console.log("Error occured during fetching the user metadata from clerk. Error : ", error)
        return res.json({
            success: false,
            message: "Unable to verify admin access right now. Please check your Clerk keys/connection and try again.",
            clerkError: error.errors?.[0]?.message || error.message,
        })
    }
}
