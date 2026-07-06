import axios from "axios"

export const getNowPlayingMovies = async(req, res) => {
    try {
        
        const {data} = await axios.get("https://api.themoviedb.org/3/movie/now_playing", {
            headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`}
        })

        const movies = data.results;
        res.json({success: true, movies : movies})

    }
    catch (error) {
        console.log("Error occured during the api call for fetching movies from the TMDB database. Error : ",error)
        res.json({success: false, message: error.message})
    }
}