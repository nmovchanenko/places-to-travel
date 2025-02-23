const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req, res) => {
    const { text, placeId, userId } = req.body;

    try {
        const comment = await prisma.comment.create({
            data: {
                text,
                placeId: parseInt(placeId),
                userId: parseInt(userId),
            },
        });
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: "Error creating comment." });
    }
});

router.get("/:placeId", async (req, res) => {
    const { placeId } = req.params;

    try {
        const comments = await prisma.comment.findMany({
            where: { placeId: parseInt(placeId) },
            include: { user: { select: { username: true } } },
        });
        res.json(comments);
    } catch (err) {
        res.status(400).json({ error: "Error fetching comments for the place." });
    }
});

router.put("/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { text, userId } = req.body;

    try {
        // Check if the comment exists and belongs to the user
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        if (comment.userId !== parseInt(userId)) {
            return res.status(403).json({ error: "You are not allowed to edit this comment." });
        }

        // Update the comment
        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(commentId) },
            data: { text },
        });
        res.json(updatedComment);
    } catch (err) {
        res.status(400).json({ error: "Error updating comment." });
    }
});

router.delete("/:commentId", async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;

    try {
        // Check if the comment exists and belongs to the user
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(commentId) },
        });

        if (!comment) {
            return res.status(404).json({ error: "Comment not found." });
        }

        if (comment.userId !== parseInt(userId)) {
            return res.status(403).json({ error: "You are not allowed to delete this comment." });
        }

        // Delete the comment
        await prisma.comment.delete({
            where: { id: parseInt(commentId) },
        });
        res.json({ message: "Comment deleted successfully." });
    } catch (err) {
        res.status(400).json({ error: "Error deleting comment." });
    }
});

module.exports = router;