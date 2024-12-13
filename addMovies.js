const { MongoClient } = require("mongodb");

// MongoDB connection URI and database
const uri = "mongodb+srv://mut23001:M1CH0NN3audy@cluster0.xu725.mongodb.net/";
const dbName = "streamflixtest";

const movies = [
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over several years, finding solace and eventual redemption through acts of common decency.",
    url: "/movies/the-shawshank-redemption",
    thumbnail: "/movies/thumbnails/shawshank.jpg",
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    url: "/movies/the-godfather",
    thumbnail: "/movies/thumbnails/godfather.jpg",
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker emerges, he causes chaos for the people of Gotham City.",
    url: "/movies/the-dark-knight",
    thumbnail: "/movies/thumbnails/dark-knight.jpg",
  },
  // Add more movies here...
];

// Generate 100 movies programmatically for variety
for (let i = 1; i <= 97; i++) {
  movies.push({
    title: `Movie ${i}`,
    description: `Description of Movie ${i}`,
    url: `/movies/movie-${i}`,
    thumbnail: `/movies/thumbnails/movie-${i}.jpg`,
  });
}

async function addMovies() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection("movies");

    // Insert movies into the collection
    const result = await collection.insertMany(movies);
    console.log(`${result.insertedCount} movies added successfully.`);
  } catch (error) {
    console.error("Error adding movies:", error.message);
  } finally {
    // Close the database connection
    await client.close();
    console.log("Database connection closed.");
  }
}

addMovies();
