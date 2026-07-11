import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Functions

// Inngest Function to save user data to a databasee
const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },

    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        }

        await User.create(userData)
    }
)

// Inngest function to delete the user from the database
const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk" },
    { event: "clerk/user.deleted" },

    async ({ event }) => {

        const { id } = event.data
        await User.findByIdAndDelete(id)

    }
)


// Inngest function to update the user data from the database
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },

    async ({ event }) => {

        const { id, first_name, last_name, email_addresses, image_url } = event.data
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: first_name + " " + last_name,
            image: image_url
        }

        await User.findByIdAndUpdate(id, userData)

    }
)

// Inngest Function to cancel booking and release the occupied seat of the show after 10 minutes when payent is not made and the payment link expires
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: "release-seats-delete-booking" },
    { event: "app/checkpayment" },
    async ({ event, step }) => {

        const

        // wait for 10 minutes
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000)
        await step.sleepUntil("wait-for-10-minutes", tenMinutesLater)

        // check for payment status
        await step.run("check-payment-status", async () => {

            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // if payment not made in 10 minutes released seats and delete bookings
            if (!booking.isPaid) {

                let show = await Show.findById(booking.show);

                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                });

                show.markModified("occupiedSeats")
                await show.save()

                await Booking.findByIdAndDelete(booking._id)

            }

        })
    }
)


// Inngest function to send email whenever user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: "send-booking-confirmation-email" },
    { event: "app/show.booked" },
    async ({ event, step }) => {
        const { bookingId } = event.data;
        const booking = await Booking.findById(bookingId).populate("user").populate({
            path: "show",
            populate: {
                path: "movie",
                model: "Movie"
            }
        });

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation for "${booking.show.movie.title}", Congratulations Ticket Booked Successfully!`,
            body: `
<div style="margin:0;padding:40px 20px;background:#f4f4f4;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:#F84565;padding:30px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:30px;">
                🎬 CinemaVerse
            </h1>
            <p style="margin:10px 0 0;color:#ffe8ec;font-size:16px;">
                Your booking is confirmed for seats ${booking.bookedSeats.join(", ")}!
            </p>
        </div>

        <!-- Body -->
        <div style="padding:35px;color:#333333;">

            <h2 style="margin-top:0;">
                Hi ${booking.user.name}, 👋
            </h2>

            <p style="font-size:16px;line-height:1.7;">
                Thank you for booking with <strong>CinemaVerse</strong>.
                Your tickets have been successfully confirmed and seat have now been reserved for you.
            </p>

            <div style="margin:30px 0;padding:20px;background:#fafafa;border-left:5px solid #F84565;border-radius:8px;">

                <h3 style="margin-top:0;color:#F84565;">
                    🎥 Booking Details
                </h3>

                <p style="margin:10px 0;">
                    <strong>Movie:</strong><br>
                    ${booking.show.movie.title}
                </p>

                <p style="margin:10px 0;">
                    <strong>Date:</strong><br>
                    ${new Date(booking.show.showDateTime).toLocaleDateString(
                "en-IN",
                { timeZone: "Asia/Kolkata" }
            )}
                </p>

                <p style="margin:10px 0;">
                    <strong>Time:</strong><br>
                    ${new Date(booking.show.showDateTime).toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                }
            )}
                </p>

                <p style="margin:10px 0;">
                    <strong>Seats:</strong><br>
                    ${booking.bookedSeats.join(", ")}
                </p>

                <p style="margin:10px 0;">
                    <strong>Amount Paid:</strong><br>
                    ₹${booking.amount}
                </p>

            </div>

            <div style="padding:18px;background:#fff7f8;border-radius:8px;">
                <p style="margin:0;font-size:15px;line-height:1.7;">
                    🍿 Please arrive at least
                    <strong>15 minutes before the show</strong>
                    to avoid any inconvenience.
                </p>
            </div>

            <p style="margin-top:30px;font-size:16px;">
                We hope you enjoy your movie! 🍿
            </p>

            <p style="font-size:16px;">
                Happy Watching,<br>
                <strong>Team CinemaVerse ❤️</strong>
            </p>

        </div>

        <!-- Footer -->
        <div style="background:#f7f7f7;padding:20px;text-align:center;color:#777777;font-size:13px;">
            This is an automated confirmation email.<br>
            Please do not reply to this message.
            <br><br>
            © ${new Date().getFullYear()} CinemaVerse. All Rights Reserved.
        </div>

    </div>
</div>
`
        })
    }
)



export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];
