const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const places = await prisma.place.findMany();
        res.json(places);
    } catch (err) {
        res.status(500).json({ error: "Error fetching places" });
    }
});

router.post("/", async (req, res) => {
    const { name, description, address, userId } = req.body;

    try {
        const place = await prisma.place.create({
            data: { name, description, address, ownerId: userId },
        });
        res.status(201).json(place);
    } catch (err) {
        res.status(400).json({ error: "Error creating place" });
    }
});

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, address, userId } = req.body;

    try {
        // Check if the user is the owner of the place
        const place = await prisma.place.findUnique({ where: { id: parseInt(id) } });
        if (!place) return res.status(404).json({ error: "Place not found" });

        if (place.ownerId !== userId) {
            return res.status(403).json({ error: "You are not allowed to edit this place." });
        }

        const updatedPlace = await prisma.place.update({
            where: { id: parseInt(id) },
            data: { name, description, address },
        });
        res.json(updatedPlace);
    } catch (err) {
        res.status(400).json({ error: "Error updating place" });
    }
});

router.post("/wishlist", async (req, res) => {
    const { userId, placeId } = req.body;

    try {
        const wishlist = await prisma.wishlist.create({
            data: { userId, placeId },
        });
        res.status(201).json(wishlist);
    } catch (err) {
        if (err.code === "P2002") {
            // Handle unique constraint violation
            res.status(400).json({ error: "Place already in wishlist" });
        } else {
            res.status(400).json({ error: "Error adding place to wishlist" });
        }
    }
});

router.get("/wishlist/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: parseInt(userId) },
            include: { place: true },
        });
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ error: "Error fetching wishlist" });
    }
});

module.exports = router;