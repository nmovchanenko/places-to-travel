const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const authRoutes = require("./routes/auth");
const placeRoutes = require("./routes/places");
const wishlistRoutes = require("./routes/wishlist");

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to the Places to Travel API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use("/auth", authRoutes);
app.use("/places", placeRoutes);
app.use("/wishlist", wishlistRoutes);
