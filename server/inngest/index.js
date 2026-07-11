import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import Movie from "../models/Movie.js";

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

        console.log(heroImage);

        await sendEmail({
            to: booking.user.email,
            subject: `Payment Confirmation for "${booking.show.movie.title}", Congratulations Ticket Booked Successfully!`,
            body: `
< !--CinemaVerse Production Email -- >
            <div style="margin:0;padding:24px;background:#eceff3;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                        <td align="center">

                            <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#18181b;border-radius:18px;overflow:hidden;border:1px solid #2d2d2d;">

                                <tr>
                                    <td>
                                        <img src="${heroImage}" alt="${booking.show.movie.title}" width="680"
                                            style="display:block;width:100%;max-width:680px;height:auto;border:0;">
                                    </td>
                                </tr>

                                <tr>
                                    <td align="center" style="background:#F84565;padding:24px;">
                                        <div style="font:700 34px Arial,sans-serif;color:#fff;">🎬 CinemaVerse</div>
                                        <div style="font:16px Arial,sans-serif;color:#ffe8ee;padding-top:8px;">
                                            Your booking is confirmed
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding:28px;font-family:Arial,sans-serif;color:#fff;">
                                        <h2 style="margin:0 0 14px;font-size:28px;">Hi ${booking.user.name}, 👋</h2>

                                        <p style="margin:0 0 26px;color:#d4d4d8;font-size:16px;line-height:1.8;">
                                            Thanks for booking with <b>CinemaVerse</b>. Your tickets are confirmed and ready!
                                        </p>

                                        <!-- Movie Card -->
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#232326;border:1px solid #333;border-radius:14px;">
                                            <tr>
                                                <td align="center" style="padding:22px;">
                                                    <img src="https://image.tmdb.org/t/p/w342${booking.show.movie.poster_path}"
                                                        alt="${booking.show.movie.title}"
                                                        width="170"
                                                        style="display:block;width:170px;max-width:100%;border-radius:10px;">
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:0 24px 24px;text-align:center;">
                                                    <h2 style="margin:0;color:#fff;font-size:28px;">
                                                        ${booking.show.movie.title}
                                                    </h2>

                                                    <p style="margin:12px 0;color:#bfbfbf;font-style:italic;font-size:16px;">
                                                        ${booking.show.movie.tagline || ""}
                                                    </p>

                                                    <p style="margin:0;color:#ededed;line-height:1.8;font-size:15px;">
                                                        ⭐ ${booking.show.movie.vote_average?.toFixed(1) || "N/A"} |
                                                        🎭 ${(booking.show.movie.genres || []).map(g => g.name || g).join(" • ")} |
                                                        ⏱ ${booking.show.movie.runtime || "--"} mins
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <h2 style="margin:34px 0 16px;color:#F84565;font-size:26px;">
                                            🎟 Booking Details
                                        </h2>

                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                            <tr>
                                                <td width="50%" style="padding:16px;border:1px solid #383838;color:#fff;">
                                                    <b>📅 Date</b><br><br>
                                                        ${new Date(booking.show.showDateTime).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
                                                    </td>

                                                        <td width="50%" style="padding:16px;border:1px solid #383838;color:#fff;">
                                                            <b>🕒 Time</b><br><br>
                                                                ${new Date(booking.show.showDateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                                                            </td>
                                                            </tr>

                                                            <tr>
                                                                <td style="padding:16px;border:1px solid #383838;color:#fff;">
                                                                    <b>💺 Seats</b><br><br>
                                                                        ${booking.bookedSeats.join(", ")}
                                                                    </td>

                                                                        <td style="padding:16px;border:1px solid #383838;color:#fff;">
                                                                            <b>💰 Amount Paid</b><br><br>
                                                                                ₹${booking.amount}
                                                                            </td>
                                                                            </tr>
                                                                        </table>

                                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                                                                            <tr>
                                                                                <td style="background:#2b2023;border-left:5px solid #F84565;padding:18px;color:#f3f4f6;border-radius:10px;font-size:15px;line-height:1.7;">
                                                                                    🍿 Please arrive <b>15 minutes before the show</b> for a smooth entry.
                                                                                </td>
                                                                            </tr>
                                                                        </table>

                                                                        <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:34px auto;">
                                                                            <tr>
                                                                                <td bgcolor="#F84565" style="border-radius:8px;">
                                                                                    <a href="https://cinemaverse.vercel.app/my-bookings"
                                                                                        style="display:inline-block;padding:16px 34px;color:#fff;font:bold 16px Arial,sans-serif;text-decoration:none;">
                                                                                        🎟 View My Bookings
                                                                                    </a>
                                                                                </td>
                                                                            </tr>
                                                                        </table>

                                                                        <p style="color:#d4d4d8;font-size:16px;line-height:1.8;">
                                                                            Enjoy your movie! ❤️<br><strong>Team CinemaVerse</strong>
                                                                        </p>

                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style="background:#101010;padding:24px;text-align:center;color:#9ca3af;font:13px Arial,sans-serif;">
                                                                    This is an automated email. Please do not reply.<br><br>
                                                                        © ${new Date().getFullYear()} CinemaVerse. All Rights Reserved.
                                                                    </td>
                                                                    </tr>

                                                                </table>

                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>`
        })
    }
)


// Inngest Function to send reminder emails
const sendShowReminders = inngest.createFunction(
    {
        id: "send-show-reminders",
    },

    // Runs every 10 minutes
    {
        cron: "*/10 * * * *",
    },

    async ({ step }) => {

        // ===================================================
        // Calculate Reminder Window (2 Hours Before Show)
        // ===================================================

        const now = new Date();

        const in2Hours = new Date(
            now.getTime() + 2 * 60 * 60 * 1000
        );

        const windowStart = new Date(
            in2Hours.getTime() - 10 * 60 * 1000
        );

        // ===================================================
        // Prepare Reminder Tasks
        // ===================================================

        const reminderTasks = await step.run(
            "prepare-reminder-tasks",
            async () => {

                const shows = await Show.find({
                    showDateTime: {
                        $gte: windowStart,
                        $lte: in2Hours,
                    },
                }).populate({
                    path: "movie",
                    select:
                        "title poster_path backdrop_path runtime genres",
                });

                const tasks = [];

                for (const show of shows) {

                    if (!show.movie) continue;

                    // Get all paid bookings for this show
                    const bookings = await Booking.find({
                        show: show._id,
                        isPaid: true,
                    }).populate({
                        path: "user",
                        select: "name email",
                    });

                    for (const booking of bookings) {

                        if (!booking.user) continue;

                        tasks.push({

                            userName: booking.user.name,
                            userEmail: booking.user.email,

                            movieTitle: show.movie.title,

                            moviePoster: `https://image.tmdb.org/t/p/w342${show.movie.poster_path}`,

                            movieBackdrop: `https://image.tmdb.org/t/p/w1280${show.movie.backdrop_path}`,

                            runtime: show.movie.runtime,
                            genres: show.movie.genres,

                            showTime: show.showDateTime,

                            bookingId: booking._id.toString(),
                            bookedSeats: booking.bookedSeats,
                            amount: booking.amount,

                            theatre: "CinemaVerse Multiplex",
                            screen: "Screen 1",

                        });
                    }
                }

                return tasks;
            }
        );

        // ===================================================
        // Nothing To Send
        // ===================================================

        if (reminderTasks.length === 0) {

            return {
                success: true,
                sent: 0,
                message: "No reminder emails to send.",
            };

        }

        // ===================================================
        // Send Reminder Emails
        // ===================================================

        const results = await step.run(
            "send-reminder-emails",
            async () => {

                return Promise.allSettled(

                    reminderTasks.map((task) =>

                        sendEmail({

                            to: task.userEmail,

                            subject:
                                `🍿 ${task.movieTitle} begins in approximately 2 hours | CinemaVerse`,

                            body: `
                                <div style="margin:0;padding:24px;background:#eceff3;">
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                        <tr><td align="center">

                                            <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#18181b;border-radius:18px;overflow:hidden;border:1px solid #2d2d2d;">

                                                <tr>
                                                    <td>
                                                        <img src="${task.movieBackdrop}" alt="${task.movieTitle}" width="680"
                                                            style="display:block;width:100%;max-width:680px;height:auto;border:0;">
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td align="center" style="background:#F84565;padding:24px;">
                                                        <div style="font:700 34px Arial,sans-serif;color:#fff;">🎬 CinemaVerse</div>
                                                        <div style="font:16px Arial,sans-serif;color:#ffe8ee;padding-top:8px;">
                                                            🍿 Your movie begins in approximately <b>2 HOURS</b>
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td style="padding:28px;font-family:Arial,sans-serif;color:#fff;">
                                                        <h2 style="margin:0 0 14px;font-size:28px;">Hi ${task.userName}, 👋</h2>

                                                        <p style="margin:0 0 26px;color:#d4d4d8;font-size:16px;line-height:1.8;">
                                                            The countdown has begun! Your CinemaVerse experience is almost here.
                                                            Please arrive <b>15–20 minutes early</b> so you can check in, grab your popcorn, and enjoy the trailers before the movie begins.
                                                        </p>

                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#232326;border:1px solid #333;border-radius:14px;">
                                                            <tr>
                                                                <td align="center" style="padding:22px;">
                                                                    <img src="${task.moviePoster}" width="170" style="display:block;width:170px;max-width:100%;border-radius:10px;">
                                                                </td>
                                                            </tr>

                                                            <tr>    
                                                                <td style="padding:0 24px 24px;text-align:center;">
                                                                    <h2 style="margin:0;color:#fff;font-size:28px;">${task.movieTitle}</h2>
                                                                    <p style="margin:12px 0;color:#ededed;line-height:1.8;font-size:15px;">
                                                                        ⭐ Runtime: ${task.runtime} mins<br>
                                                                            🎭 ${ Array.isArray(task.genres) ? task.genres.map(genre => genre.name).join(" • ") : task.genres }
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>

                                                        <h2 style="margin:34px 0 16px;color:#F84565;font-size:26px;">⏰ Reminder Details</h2>

                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                                            <tr>
                                                                <td width="50%" style="padding:16px;border:1px solid #383838;color:#fff;"><b>📅 Date</b><br><br>${new Date(task.showTime).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                                                                    <td width="50%" style="padding:16px;border:1px solid #383838;color:#fff;"><b>🕒 Time</b><br><br>${new Date(task.showTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}</td>
                                                                    </tr>
                                                                        <tr>
                                                                            <td style="padding:16px;border:1px solid #383838;color:#fff;"><b>💺 Seats</b><br><br>${task.bookedSeats.join(", ")}</td>
                                                                                <td style="padding:16px;border:1px solid #383838;color:#fff;"><b>💰 Amount Paid</b><br><br>₹${task.amount}</td>
                                                                                </tr>
                                                                                    <tr>
                                                                                        <td style="padding:16px;border:1px solid #383838;color:#fff;"><b>📍 Theatre</b><br><br>${task.theatre}</td>
                                                                                            <td style="padding:16px;border:1px solid #383838;color:#fff;"><b>🎞 Screen</b><br><br>${task.screen}</td>
                                                                                            </tr>
                                                                                                <tr>
                                                                                                    <td colspan="2" style="padding:16px;border:1px solid #383838;color:#fff;"><b>🎟 Booking ID</b><br><br>${task.bookingId}</td>
                                                                                                    </tr>
                                                                                                    </table>

                                                                                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                                                                                                        <tr>
                                                                                                            <td style="background:#2b2023;border-left:5px solid #F84565;padding:18px;color:#f3f4f6;border-radius:10px;font-size:15px;line-height:1.7;">
                                                                                                                ⏰ <b>Your movie begins in approximately 2 HOURS.</b><br><br>
                                                                                                                    🍿 Lights dim. The story begins soon.
                                                                                                                </td>
                                                                                                                </tr>
                                                                                                            </table>

                                                                                                            <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:34px auto;">
                                                                                                                <tr>
                                                                                                                    <td bgcolor="#F84565" style="border-radius:8px;">
                                                                                                                        <a href="#"
                                                                                                                            style="display:inline-block;padding:16px 34px;color:#fff;font:bold 16px Arial,sans-serif;text-decoration:none;">
                                                                                                                            🍿 Open My Ticket
                                                                                                                        </a>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            </table>

                                                                                                            <p style="color:#d4d4d8;font-size:16px;line-height:1.8;">
                                                                                                                See you at the movies! ❤️<br><strong>Team CinemaVerse</strong>
                                                                                                            </p>

                                                                                                        </td></tr>

                                                                                                <tr>
                                                                                                    <td style="background:#101010;padding:24px;text-align:center;color:#9ca3af;font:13px Arial,sans-serif;">
                                                                                                        This is an automated reminder email. Please do not reply.<br><br>
                                                                                                            © ${new Date().getFullYear()} CinemaVerse. All Rights Reserved.
                                                                                                        </td>
                                                                                                        </tr>

                                                                                                    </table>

                                                                                            </td></tr>
                                                                                        </table>
                                                                                    </div>
`


                        }))

                );

            });

        // ===================================================
        // Summary
        // ===================================================

        const successful = results.filter((result) => result.status === "fulfilled").length;

        const failed = results.filter((result) => result.status === "rejected").length;

        return {

            success: true,

            total: reminderTasks.length,

            sent: successful,

            failed,

            message:
                `Successfully sent ${successful} reminder email(s). ${failed} failed.`,

        };

    }
);


// ==========================================================
// Inngest Function : Notify All Users About New Movie
// ==========================================================

const sendNewShowNotifications = inngest.createFunction(

    {
        id: "send-new-show-notifications",
    },

    {
        event: "app/show.added",
    },

    async ({ event }) => {

        const { movieTitle, movieId } = event.data;

        // Fetch Movie Details
        const movie = await Movie.findById(movieId);

        if (!movie) {

            return {
                success: false,
                message: "Movie not found."
            };

        }

        // Fetch All Registered Users

        const users = await User.find({})
            .select("name email");

        if (users.length === 0) {

            return {
                success: true,
                totalUsers: 0,
                message: "No registered users found."
            };

        }

        // Send Emails

        const results = await Promise.allSettled(

            users.map((user) => {

                const emailData = {

                    // User
                    userName: user.name,
                    userEmail: user.email,

                    // Movie
                    movieTitle: movie.title,

                    moviePoster:
                        `https://image.tmdb.org/t/p/w342${movie.poster_path}`,

                    movieBackdrop:
                        `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,

                    tagline: movie.tagline,

                    overview: movie.overview,

                    runtime: movie.runtime,

                    genres: movie.genres,

                    rating: movie.vote_average,

                    releaseDate: movie.release_date,

                    movieId

                };

                return sendEmail({

                    to: emailData.userEmail,

                    subject: `🎬 A New Movie Has Arrived on CinemaVerse | ${emailData.movieTitle} is now Available for Booking`,

                    body: `
                    <div style="margin:0;padding:24px;background:#eceff3;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            <tr>
                                <td align="center">

                                    <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;background:#18181b;border-radius:18px;overflow:hidden;border:1px solid #2d2d2d;">

                                        <tr>
                                            <td>
                                                <img src="${emailData.movieBackdrop}" alt="${emailData.movieTitle}" width="680"
                                                    style="display:block;width:100%;max-width:680px;height:auto;border:0;">
                                            </td>
                                        </tr>

                                        <tr>
                                            <td align="center" style="background:#F84565;padding:24px;">
                                                <div style="font:700 34px Arial,sans-serif;color:#fff;">🎬 CinemaVerse</div>
                                                <div style="font:16px Arial,sans-serif;color:#ffe8ee;padding-top:8px;">
                                                    A New Movie Has Arrived!
                                                </div>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td style="padding:28px;font-family:Arial,sans-serif;color:#fff;">
                                                <h2 style="margin:0 0 14px;font-size:28px;">Hi ${emailData.userName}, 👋</h2>

                                                <p style="margin:0 0 26px;color:#d4d4d8;font-size:16px;line-height:1.8;">
                                                    Lights dim.<br>The screen comes alive.<br><br>We're excited to announce that <b>${emailData.movieTitle}</b> has officially arrived on <b>CinemaVerse</b>. Explore the story, discover show timings and reserve your favourite seats before they're gone!
                                                    </p>

                                                        <!-- Movie Card -->
                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#232326;border:1px solid #333;border-radius:14px;">
                                                            <tr>
                                                                <td align="center" style="padding:22px;">
                                                                    <img src="${emailData.moviePoster}"
                                                                        alt="${emailData.movieTitle}"
                                                                        width="170"
                                                                        style="display:block;width:170px;max-width:100%;border-radius:10px;">
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td style="padding:0 24px 24px;text-align:center;">
                                                                    <h2 style="margin:0;color:#fff;font-size:28px;">
                                                                        ${emailData.movieTitle}
                                                                    </h2>

                                                                    <p style="margin:12px 0;color:#bfbfbf;font-style:italic;font-size:16px;">
                                                                        ${emailData.tagline}
                                                                    </p>

                                                                    <p style="margin:0;color:#ededed;line-height:1.8;font-size:15px;">
                                                                        ⭐ ${emailData.rating} |
                                                                        🎭 ${Array.isArray(emailData.genres) ? emailData.genres.join(" • ") : emailData.genres} |
                                                                        ⏱ ${emailData.runtime} mins
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>


                                                        <h2 style="margin:34px 0 16px;color:#F84565;font-size:26px;">📝 Story Preview</h2>

                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                                            <tr>
                                                                <td style="padding:18px;border:1px solid #383838;color:#d4d4d8;line-height:1.8;">
                                                                    ${emailData.overview}
                                                                </td>
                                                            </tr>
                                                        </table>

                                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                                                            <tr>
                                                                <td style="background:#2b2023;border-left:5px solid #F84565;padding:18px;color:#f3f4f6;border-radius:10px;font-size:15px;line-height:1.7;">
                                                                    🍿 <b>Booking is now open.</b><br><br>Reserve your favourite seats early and experience this movie on the big screen with CinemaVerse.
                                                                    </td>
                                                                    </tr>
                                                                </table>

                                                                <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:34px auto;">
                                                                    <tr>
                                                                        <td bgcolor="#F84565" style="border-radius:8px;">
                                                                            <a href="#"
                                                                                style="display:inline-block;padding:16px 34px;color:#fff;font:bold 16px Arial,sans-serif;text-decoration:none;">
                                                                                🎬 Explore Movie
                                                                            </a>
                                                                        </td>
                                                                    </tr>
                                                                </table>

                                                                <p style="color:#d4d4d8;font-size:16px;line-height:1.8;">
                                                                    See you at the movies! ❤️<br><strong>Team CinemaVerse</strong>
                                                                </p>

                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td style="background:#101010;padding:24px;text-align:center;color:#9ca3af;font:13px Arial,sans-serif;">
                                                                This is an automated email. Please do not reply.<br><br>
                                                                    © ${new Date().getFullYear()} CinemaVerse. All Rights Reserved.
                                                                </td>
                                                                </tr>

                                                            </table>

                                                        </td>
                                                    </tr>
                                                    </table>
                                                </div>`
                });

            })

        );

        // Summary

        const sent = results.filter(
            result => result.status === "fulfilled"
        ).length;

        const failed = results.filter(
            result => result.status === "rejected"
        ).length;

        return {

            success: true,

            movie: movieTitle,

            totalUsers: users.length,

            sent,

            failed,

            message:
                `Successfully notified ${sent} users about "${movieTitle}". ${failed} email(s) failed.`

        };

    }

);




export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail, sendShowReminders, sendNewShowNotifications, ];
