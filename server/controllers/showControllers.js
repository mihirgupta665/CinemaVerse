import axios from "axios"
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { inngest } from "../inngest/index.js";

const getValidShows = async (query = {}, sort = { showDateTime: 1 }) => {
    const shows = await Show.find(query).populate("movie").sort(sort);
    const orphanShowIds = shows
        .filter((show) => !show.movie)
        .map((show) => show._id);

    if (orphanShowIds.length) {
        await Show.deleteMany({ _id: { $in: orphanShowIds } });
    }

    return shows.filter((show) => show.movie);
};

const getTmdbRequestConfig = () => {
    const tmdbCredential = process.env.TMDB_API_KEY;

    if (!tmdbCredential) {
        throw new Error("TMDB_API_KEY is missing in the server environment.");
    }

    const requestConfig = {
        timeout: 10000,
    };

    // TMDB v4 tokens are used as Bearer tokens. Older v3 keys are sent as query params.
    if (tmdbCredential.includes(".")) {
        requestConfig.headers = {
            Authorization: `Bearer ${tmdbCredential}`,
        };
    } else {
        requestConfig.params = {
            api_key: tmdbCredential,
        };
    }

    return requestConfig;
};


// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    const MAX_RETRIES = 5;

    try {
        let data;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await axios.get(
                    "https://api.themoviedb.org/3/movie/now_playing",
                    getTmdbRequestConfig()
                );

                data = response.data;
                break; // Request successful
            } catch (error) {
                console.log(`Attempt ${attempt} failed.`);
                console.log("TMDB status:", error.response?.status);
                console.log("TMDB details:", error.response?.data || error.message);

                // If this was the last attempt, throw the error
                if (attempt === MAX_RETRIES) {
                    throw error;
                }

                // Wait 1 second before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return res.json({
            success: true,
            movies: data?.results || [],
        });

    } catch (error) {
        console.log(
            "Error occurred during the API call for fetching movies from the TMDB database:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            success: false,
            message: error.response?.data?.status_message || error.message,
        });
    }
};

// API to add a new show to the database
export const addShows = async (req, res) => {

    try {

        const { movieId, showsInput, showPrice } = req.body

        let movie = await Movie.findById(movieId)

        if (!movie) {
            // fetch movie details and credits from the TMDB API
            // Fetch movie details and credits from TMDB API with retry
            let movieDetailsResponse, movieCreditsResponse;

            const MAX_RETRIES = 5;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {

                    [movieDetailsResponse, movieCreditsResponse] = await Promise.all([

                        axios.get(
                            `https://api.themoviedb.org/3/movie/${movieId}`,
                            getTmdbRequestConfig()
                        ),

                        axios.get(
                            `https://api.themoviedb.org/3/movie/${movieId}/credits`,
                            getTmdbRequestConfig()
                        )

                    ]);

                    // Success
                    break;

                } catch (error) {

                    console.log(`TMDB attempt ${attempt} failed.`);
                    console.log("TMDB status:", error.response?.status);
                    console.log("TMDB details:", error.response?.data || error.message);

                    if (attempt === MAX_RETRIES) {
                        throw error;
                    }

                    // Wait 1 second before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;
            // console.log("Movie Credits Data of response : ", movieCreditsResponse)

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            }

            const moviedoc = await Movie.create(movieDetails);
            movie = moviedoc;
            // console.log(movieDetails);

            // Trigger the Inngest send email functionality to send the email for the newly created movie
            try {

                await inngest.send({
                    name: "app/show.added",
                    data: {
                        movieTitle: moviedoc.title,
                        movieId: moviedoc._id
                    }
                });

            }
            catch (err) {

                console.error(
                    "Failed to queue movie notification",
                    err
                );

            }

        }

        // showInput is array of object of date
        // this date object have date property and time property
        // time property itself has an array of time for all show
        const showsToCreate = [];
        showsInput.forEach((show) => {
            const timeValues = Array.isArray(show.time) ? show.time : [show.time];

            timeValues.forEach((timeValue) => {
                const dateTimeString = typeof timeValue === "string" && timeValue.includes("T")
                    ? timeValue
                    : `${show.date}T${timeValue}`;

                showsToCreate.push({
                    movie: movie._id,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                });
            });
        });

        if (showsToCreate.length > 1) {
            await Show.insertMany(showsToCreate)
            res.json({ success: true, message: "Shows Added Successfully!" })
        }
        else if (showsToCreate.length === 1) {
            await Show.insertMany(showsToCreate)
            res.json({ success: true, message: "Show Added Successfully!" })
        }

    }
    catch (error) {
        console.log("Error occured during fetching the movie from tmdb and saving the movie and show in database. Error : ", error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all shows from the database
export const getShows = async (req, res) => {
    try {

        const shows = await getValidShows(
            { showDateTime: { $gte: new Date() } },
            { showDateTime: 1 }
        );

        const uniqueShows = Array.from(
            new Map(shows.map((show) => [show.movie._id.toString(), show.movie])).values()
        );

        res.json({ success: true, shows: uniqueShows })

    }
    catch (error) {
        console.log("Error occured during fetching unique shows from the database. Error : ", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get recent shows added within the last 7 days
export const getRecentShows = async (req, res) => {
    try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const shows = await Show.find({
            showDateTime: { $gte: sevenDaysAgo }
        })
            .populate('movie')
            .sort({ showDateTime: -1 })

        const orphanShowIds = shows
            .filter((show) => !show.movie)
            .map((show) => show._id)

        if (orphanShowIds.length) {
            await Show.deleteMany({ _id: { $in: orphanShowIds } })
        }

        const validShows = shows.filter((show) => show.movie)

        res.json({ success: true, shows: validShows })
    }
    catch (error) {
        console.log("Error occured during fetching recent shows from the database. Error : ", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get a single show from the database

export const getShow = async (req, res) => {
    try {

        const { movieId } = req.params

        // get All upcoming shows for the movie 
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } })

        // get movie gte current date otherwise just no dateTime will be visible
        const movie = await Movie.findById(movieId);
        if (!movie) {
            await Show.deleteMany({ movie: movieId });
            return res.status(404).json({
                success: false,
                message: "This movie is no longer available.",
            });
        }

        const dateTime = {};

        // Build grouped dateTime (server-side) using IST to preserve existing behavior
        shows.forEach((show) => {
            const date = new Date(show.showDateTime).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })

        // Also return rawShows (ISO strings) so clients can group by the visitor's local timezone if desired
        const rawShows = shows.map((show) => ({ showId: show._id, showDateTime: new Date(show.showDateTime).toISOString() }));

        res.json({ success: true, movie, dateTime, rawShows })

    }
    catch (error) {
        console.log("Error occured during fetching show and timings for a particular movie a from the database. Error : ", error)
        res.json({ success: false, message: error.message })
    }
}

// API to get the latest movie trailers from TMDB
export const getLatestTrailers = async (req, res) => {
    try {
        const response = await axios.get(
            "https://api.themoviedb.org/3/movie/now_playing",
            getTmdbRequestConfig()
        );
        const movies = response.data?.results?.slice(0, 8) || [];
        
        const trailerPromises = movies.map(async (movie) => {
            try {
                const videoRes = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movie.id}/videos`,
                    getTmdbRequestConfig()
                );
                const videos = videoRes.data?.results || [];
                // Find official trailer first, then any trailer, then any video
                const trailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
                                videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
                                videos.find(v => v.site === "YouTube");
                
                if (trailer) {
                    return {
                        image: `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`,
                        videoUrl: `https://www.youtube.com/watch?v=${trailer.key}`
                    };
                }
            } catch (err) {
                console.error(`Failed to fetch videos for movie ${movie.id}:`, err.message);
            }
            return null;
        });

        const trailers = (await Promise.all(trailerPromises)).filter(Boolean).slice(0, 4);

        if (trailers.length < 4) {
            const dummy = [
                {
                    image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
                    videoUrl: 'https://www.youtube.com/watch?v=WpW36ldAqnM'
                },
                {
                    image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
                    videoUrl: 'https://www.youtube.com/watch?v=-sAOWhvheK8'
                },
                {
                    image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
                    videoUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y'
                },
                {
                    image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
                    videoUrl: 'https://www.youtube.com/watch?v=umiKiW4En9g'
                }
            ];
            while (trailers.length < 4) {
                trailers.push(dummy[trailers.length]);
            }
        }

        res.json({ success: true, trailers });
    } catch (error) {
        console.error("Error fetching latest trailers:", error.message);
        const dummy = [
            {
                image: "https://img.youtube.com/vi/WpW36ldAqnM/maxresdefault.jpg",
                videoUrl: 'https://www.youtube.com/watch?v=WpW36ldAqnM'
            },
            {
                image: "https://img.youtube.com/vi/-sAOWhvheK8/maxresdefault.jpg",
                videoUrl: 'https://www.youtube.com/watch?v=-sAOWhvheK8'
            },
            {
                image: "https://img.youtube.com/vi/1pHDWnXmK7Y/maxresdefault.jpg",
                videoUrl: 'https://www.youtube.com/watch?v=1pHDWnXmK7Y'
            },
            {
                image: "https://img.youtube.com/vi/umiKiW4En9g/maxresdefault.jpg",
                videoUrl: 'https://www.youtube.com/watch?v=umiKiW4En9g'
            }
        ];
        res.json({ success: true, trailers: dummy });
    }
}
