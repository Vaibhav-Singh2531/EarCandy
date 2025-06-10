import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/auth-middleware.js";
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrindingSongs } from "../controller/song-controller.js";

const router = Router();

router.get("/",protectRoute,requireAdmin , getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending",getTrindingSongs);

export default router;