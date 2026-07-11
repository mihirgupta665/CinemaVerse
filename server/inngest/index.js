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

        if (!booking || !booking.show || !booking.show.movie) {
            throw new Error("Booking or movie details not found.");
        }

        const heroImage = booking.show.movie.backdrop_path
            ? `https://image.tmdb.org/t/p/original${booking.show.movie.backdrop_path}`
            : booking.show.movie.poster_path
                ? `https://image.tmdb.org/t/p/original${booking.show.movie.poster_path}`
                : "https://via.placeholder.com/1280x720?text=CinemaVerse";

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation for "${booking.show.movie.title}", Congratulations Ticket Booked Successfully!`,
            body: `
<div style="margin:0;padding:40px 20px;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.12);">

    <!-- Hero Image -->
    <img src="${heroImage}"
         alt="${booking.show.movie.title}"
         style="width:100%;height:340px;object-fit:cover;display:block;"/>

    <!-- Brand -->
    <div style="background:#F84565;padding:28px;text-align:center;color:#fff;">
      <div style="font-size:34px;font-weight:bold;">🎬 CinemaVerse</div>
      <div style="margin-top:10px;font-size:17px;">
        Booking Confirmed Successfully
      </div>
    </div>

    <div style="padding:35px;">

      <h2 style="margin:0;color:#222;">
        Hi ${booking.user.name}, 👋
      </h2>

      <p style="color:#555;font-size:16px;line-height:1.8;margin-top:15px;">
        Your booking has been confirmed and your seats are now reserved.
        Thank you for choosing <strong>CinemaVerse</strong>. We hope you have an amazing movie experience!
      </p>

      <!-- Movie Card -->
      <table width="100%" cellspacing="0" cellpadding="0" style="margin:30px 0;border:1px solid #ececec;border-radius:14px;background:#fafafa;">
        <tr>
          <td width="150" style="padding:20px;">
            <img src="https://image.tmdb.org/t/p/w342${booking.show.movie.poster_path}"
                 alt="${booking.show.movie.title}"
                 style="width:120px;border-radius:10px;display:block;">
          </td>

          <td style="padding:20px;vertical-align:top;">
            <h2 style="margin:0;color:#222;">
              ${booking.show.movie.title}
            </h2>

            <p style="margin:10px 0;color:#666;font-style:italic;">
              ${booking.show.movie.tagline || ""}
            </p>

            <p style="margin:0;color:#555;font-size:15px;">
              ⭐ <strong>${booking.show.movie.vote_average?.toFixed(1) || "N/A"}</strong>
              &nbsp; • &nbsp;
              🎭 ${(booking.show.movie.genres || []).map(g => g.name || g).join(" • ")}
              &nbsp; • &nbsp;
              ⏱ ${booking.show.movie.runtime || "--"} mins
            </p>
          </td>
        </tr>
      </table>

      <!-- Booking Details -->
      <h3 style="color:#F84565;margin-bottom:15px;">
        🎟 Booking Details
      </h3>

      <table width="100%" cellspacing="0" cellpadding="12" style="border-collapse:collapse;font-size:15px;">
        <tr>
          <td style="background:#fafafa;border:1px solid #eee;">
            <strong>📅 Date</strong><br>
            ${new Date(booking.show.showDateTime).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
          </td>

          <td style="background:#fafafa;border:1px solid #eee;">
            <strong>🕒 Time</strong><br>
            ${new Date(booking.show.showDateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
          </td>
        </tr>

        <tr>
          <td style="background:#fafafa;border:1px solid #eee;">
            <strong>💺 Seats</strong><br>
            ${booking.bookedSeats.join(", ")}
          </td>

          <td style="background:#fafafa;border:1px solid #eee;">
            <strong>💰 Amount Paid</strong><br>
            ₹${booking.amount}
          </td>
        </tr>
      </table>

      <div style="margin:30px 0;padding:18px;background:#fff5f7;border-left:5px solid #F84565;border-radius:10px;color:#555;line-height:1.7;">
        🍿 Please arrive at least <strong>15 minutes before the show</strong> for a hassle-free entry.
      </div>

      <div style="text-align:center;margin:35px 0;">
        <a href="https://cinemaverse.vercel.app/my-bookings"
           style="display:inline-block;background:#F84565;color:#fff;text-decoration:none;padding:15px 34px;border-radius:10px;font-weight:bold;font-size:15px;">
          🎬 View My Bookings
        </a>
      </div>

      <p style="font-size:16px;color:#444;">
        Enjoy your show! ❤️<br><br>
        <strong>Team CinemaVerse</strong>
      </p>

    </div>

    <div style="background:#f7f7f7;padding:22px;text-align:center;color:#777;font-size:13px;">
      This is an automated email. Please do not reply.<br><br>
      © ${new Date().getFullYear()} CinemaVerse. All Rights Reserved.
    </div>

  </div>
</div>
`
        })
    }
)



export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];
