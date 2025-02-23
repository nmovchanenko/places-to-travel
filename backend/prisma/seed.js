const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    // Create users
    const passwordHash = await bcrypt.hash("password123", 10);

    const user1 = await prisma.user.create({
        data: {
            username: "john_doe",
            email: "john@example.com",
            password: passwordHash,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            username: "jane_doe",
            email: "jane@example.com",
            password: passwordHash,
        },
    });

    console.log("Users created:", user1, user2);

    // Create places
    const place1 = await prisma.place.create({
        data: {
            name: "Eiffel Tower",
            description: "An iconic symbol of Paris.",
            address: "Champ de Mars, 75007 Paris, France",
            ownerId: user1.id,
        },
    });

    const place2 = await prisma.place.create({
        data: {
            name: "Great Wall of China",
            description: "A historic fortification in China.",
            address: "China",
            ownerId: user2.id,
        },
    });

    // Add places to wishlists
    await prisma.wishlist.create({
        data: { userId: user2.id, placeId: place1.id },
    });

    await prisma.wishlist.create({
        data: { userId: user1.id, placeId: place2.id },
    });

    console.log("Seeding complete!");
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });