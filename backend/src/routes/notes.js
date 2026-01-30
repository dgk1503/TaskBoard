import express from "express";
import {
  createNotes,
  deleteNotes,
  getAllNotes,
  updateNotes,
} from "../controllers/notesControllers.js";
import { protect } from "../../middleware/JWTVerification.js";
const noterouter = express.Router();

noterouter.use(protect);

noterouter.route("/").get(getAllNotes).post(createNotes);

noterouter.route("/:id").put(updateNotes).delete(deleteNotes);

export default noterouter;
