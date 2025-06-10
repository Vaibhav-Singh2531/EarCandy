import {Router} from "express"
import { createSong , deleteSong ,createAlbums , deleteAlbums , checkAdmin} from "../controller/admin-controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth-middleware.js";

const router = Router();

router.use(requireAdmin);

router.get("/check",checkAdmin);
router.post("/songs",createSong);
router.delete("/songs/:id",deleteSong);
router.post("/albums",createAlbums);
router.delete("/albums/:id",deleteAlbums);


export default router;