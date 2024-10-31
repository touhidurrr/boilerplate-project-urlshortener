require("dotenv").config();
const { Database } = require("bun:sqlite");
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

// initialize database
const db = new Database(":memory:");
db.exec(await Bun.file("index.sql").text());

// URL Shortener Microservice
const isValidURL = (url) => {
  try {
    const newUrl = new URL(url);
    return ["http:", "https:"].includes(newUrl.protocol);
  } catch (e) {
    return false;
  }
};

const shorturlPostQuery = db.query(
  "insert into shorturl(original_url) values(?) returning *;",
);

app.post("/api/shorturl", async ({ body: { url } }, res) => {
  if (!isValidURL(url)) {
    res.json({ error: "invalid url" });
    return;
  }

  res.json(shorturlPostQuery.get(url));
});

const shorturlGetQuery = db.query(
  "select original_url from shorturl where (short_url = ?);",
);

app.get("/api/shorturl/:id", async ({ params: { id } }, res) => {
  res.redirect(shorturlGetQuery.get(id).original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
