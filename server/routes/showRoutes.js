import express from "express"
import { addShows, getNowPlayingMovies, getShow, getShows, getRecentShows } from "../controllers/showControllers.js"
import { protectAdmin } from "../middlewares/auth.js"

const showRouter = express.Router()

showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies)
showRouter.post("/add", protectAdmin, addShows)
showRouter.get("/all", getShows)
showRouter.get("/recent", getRecentShows)
showRouter.get("/:movieId", getShow)




export default showRouter;