const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

app.get("/movies/", async (request, response) => {
  const movieListQuery = `
    SELECT movie_name AS movieName FROM movie;`;
  const dbResponse = await db.all(movieListQuery);
  response.send(dbResponse);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (
        ${directorId},
         '${movieName}',
         '${leadActor}'
      );`;
  const dbResponse = await db.run(addMovieQuery);
  const movie_id = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieListQuery = `
    SELECT movie_id AS movieId,
    director_id AS directorId,
    movie_name AS movieName,
    lead_actor AS leadActor 
    FROM movie
    WHERE movieId = ${movieId}`;
  const dbResponse = await db.get(getMovieListQuery);
  response.send(dbResponse);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
    UPDATE 
    movie 
    SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//director methods

app.get("/directors/", async (request, response) => {
  const directorListQuery = `
    SELECT director_id AS directorId,
    director_name AS directorName FROM director;`;
  const dbResponse = await db.all(directorListQuery);
  response.send(dbResponse);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieListQuery = `
    SELECT
    movie_name AS movieName FROM movie
    WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(directorMovieListQuery);
  response.send(dbResponse);
});

initializeDBAndServer();

module.exports = app;
