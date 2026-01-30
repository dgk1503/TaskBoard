import Note from "../../models/Note.js";

// get all
export const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// create notes
export const createNotes = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Login to create notes" });
    }

    const newNote = new Note({
      title,
      content,
      user: req.user._id,
    });

    await newNote.save();
    res.status(201).json({
      success: true,
      message: "Note Created Successfully",
      note: newNote,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// update notes
export const updateNotes = async (req, res) => {
  try {
    const noteDoc = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!noteDoc) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this note",
      });
    }

    if (noteDoc.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this note",
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({ success: true, note: updatedNote });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete notes
export const deleteNotes = async (req, res) => {
  try {
    const noteDoc = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!noteDoc) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    await noteDoc.deleteOne();
    res.json({ success: true, message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
