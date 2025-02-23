const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req, res) => {
    const { userId, placeId } = req.body;

    try {
        // Prevent duplicates
        const existingEntry = await prisma.wishlist.findUnique({
            where: {
                userId_placeId: { userId: parseInt(userId), placeId: parseInt(placeId) },
            },
        });
        if (existingEntry) {
            return res.status(400).json({ error: "Place is already in wishlist." });
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: parseInt(userId),
                placeId: parseInt(placeId),
            },
        });

        res.status(201).json(wishlistItem);
    } catch (err) {
        res.status(500).json({ error: "Error adding place to wishlist." });
    }
});

router.put("/:wishlistId/visited", async (req, res) => {
    const { wishlistId } = req.params;
    const { visited } = req.body;

    try {
        const updatedWishlist = await prisma.wishlist.update({
            where: { id: parseInt(wishlistId) },
            data: { visited },
        });
        res.json(updatedWishlist);
    } catch (err) {
        res.status(400).json({ error: "Error updating wishlist status." });
    }
});

// Get a filtered list of wishlisted places
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    const { visited, location } = req.query; // Optional filters

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: {
                userId: parseInt(userId),
                ...(visited !== undefined && { visited: visited === "true" }),
                ...(location && {
                    place: { address: { contains: location } },
                }),
            },
            include: { place: true }, // Include place details
        });

        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ error: "Error fetching wishlist." });
    }
});

// Remove a place from the wishlist
router.delete("/:userId/:placeId", async (req, res) => {
    const { userId, placeId } = req.params;

    try {
        const existingEntry = await prisma.wishlist.findUnique({
            where: {
                userId_placeId: { userId: parseInt(userId), placeId: parseInt(placeId) },
            },
        });

        if (!existingEntry) {
            return res.status(404).json({ error: "Place not found in wishlist." });
        }

        await prisma.wishlist.delete({
            where: {
                userId_placeId: { userId: parseInt(userId), placeId: parseInt(placeId) },
            },
        });

        res.json({ message: "Place removed from wishlist." });
    } catch (err) {
        res.status(500).json({ error: "Error removing place from wishlist." });
    }
});

module.exports = router;