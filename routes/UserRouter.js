const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");

// Route 1: /user/list — minimal info for navigation sidebar
router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).send({ error: "Unable to fetch users" });
  }
});

// Route 2: /user/:id — detailed user info
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ error: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId, "_id first_name last_name location description occupation");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send({ error: "Error retrieving user info" });
  }
});

// Route 3: /photosOfUser/:id — photos with embedded comments
router.get("/photosOfUser/:id", async (req, res) => {
  const userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ error: "Invalid user ID format" });
  }

  try {
    const photos = await Photo.find({ user_id: userId }).lean();
    for (let photo of photos) {
      for (let comment of photo.comments) {
        const user = await User.findById(comment.user_id, "_id first_name last_name");
        comment.user = user;
      }
    }
    res.json(photos);
  } catch (err) {
    res.status(500).send({ error: "Error retrieving photos" });
  }
});

module.exports = router;
