const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

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

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    const { visited } = req.query; // optional query parameter

    try {
        const wishlist = await prisma.wishlist.findMany({
            where: {
                userId: parseInt(userId),
                ...(visited !== undefined && { visited: visited === "true" }),
            },
            include: { place: true },
        });
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ error: "Error fetching wishlist." });
    }
});

module.exports = router;