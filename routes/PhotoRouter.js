const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const Photo = require("../db/photoModel");

// /photosOfUser/:id - Get photos of a user with their comments
router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id })
      .populate("comments.user", "_id first_name last_name") // Populate comment's user details
      .exec();

    if (photos.length === 0) {
      return res.status(400).json({ message: "No photos found for this user" });
    }

    const response = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      comments: photo.comments.map(comment => ({
        comment: comment.comment,
        date_time: comment.date_time,
        _id: comment._id,
        user: comment.user, // user object populated with _id, first_name, last_name
      })),
      file_name: photo.file_name,
      date_time: photo.date_time,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Error fetching photos for user", error });
  }
});

module.exports = router;
