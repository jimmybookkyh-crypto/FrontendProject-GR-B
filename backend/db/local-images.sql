-- ------- Local WebP images (T192) -------
-- Image files: frontend/public/images/movies/<name>-<200|400|800>.webp
--              frontend/public/images/events/<name>-<600|1200>.webp

BEGIN;

-- ------- Movies -------
UPDATE movies SET images = '["thor-love-and-thunder"]' WHERE "movieId" = 1; -- Thor: Love and Thunder
UPDATE movies SET images = '["the-dark-knight"]' WHERE "movieId" = 10; -- The Dark Knight
UPDATE movies SET images = '["the-incredibles"]' WHERE "movieId" = 11; -- The Incredibles
UPDATE movies SET images = '["incredibles-2"]' WHERE "movieId" = 12; -- Incredibles 2
UPDATE movies SET images = '["spider-man-homecoming"]' WHERE "movieId" = 13; -- Spider-Man: Homecoming
UPDATE movies SET images = '["avengers-endgame"]' WHERE "movieId" = 14; -- Avengers: Endgame
UPDATE movies SET images = '["black-panther"]' WHERE "movieId" = 15; -- Black Panther
UPDATE movies SET images = '["shazam"]' WHERE "movieId" = 16; -- Shazam!
UPDATE movies SET images = '["aquaman"]' WHERE "movieId" = 17; -- Aquaman
UPDATE movies SET images = '["doctor-strange"]' WHERE "movieId" = 18; -- Doctor Strange
UPDATE movies SET images = '["guardians-of-the-galaxy-3"]' WHERE "movieId" = 19; -- Guardians of the Galaxy Vol. 3
UPDATE movies SET images = '["spider-man"]' WHERE "movieId" = 20; -- Spider-Man
UPDATE movies SET images = '["spider-man-2"]' WHERE "movieId" = 21; -- Spider-Man 2
UPDATE movies SET images = '["spider-man-3"]' WHERE "movieId" = 22; -- Spider-Man 3
UPDATE movies SET images = '["the-amazing-spider-man"]' WHERE "movieId" = 23; -- The Amazing Spider-Man
UPDATE movies SET images = '["the-amazing-spider-man-2"]' WHERE "movieId" = 24; -- The Amazing Spider-Man 2
UPDATE movies SET images = '["spider-man-into-the-spider-verse"]' WHERE "movieId" = 25; -- Spider-Man: Into the Spider-Verse
UPDATE movies SET images = '["spider-man-far-from-home"]' WHERE "movieId" = 26; -- Spider-Man: Far From Home
UPDATE movies SET images = '["spider-man-no-way-home"]' WHERE "movieId" = 27; -- Spider-Man: No Way Home
UPDATE movies SET images = '["spider-man-across-the-spider-verse"]' WHERE "movieId" = 28; -- Spider-Man: Across the Spider-Verse
UPDATE movies SET images = '["the-dark-knight-rises"]' WHERE "movieId" = 29; -- The Dark Knight Rises
UPDATE movies SET images = '["the-lego-batman-movie"]' WHERE "movieId" = 30; -- The Lego Batman Movie
UPDATE movies SET images = '["the-batman"]' WHERE "movieId" = 31; -- The Batman
UPDATE movies SET images = '["iron-man"]' WHERE "movieId" = 32; -- Iron Man
UPDATE movies SET images = '["thor"]' WHERE "movieId" = 33; -- Thor
UPDATE movies SET images = '["captain-america-the-first-avenger"]' WHERE "movieId" = 34; -- Captain America: The First Avenger
UPDATE movies SET images = '["the-avengers"]' WHERE "movieId" = 35; -- The Avengers
UPDATE movies SET images = '["guardians-of-the-galaxy"]' WHERE "movieId" = 36; -- Guardians of the Galaxy
UPDATE movies SET images = '["avengers-infinity-war"]' WHERE "movieId" = 37; -- Avengers: Infinity War
UPDATE movies SET images = '["batman"]' WHERE "movieId" = 38; -- Batman
UPDATE movies SET images = '["batman-returns"]' WHERE "movieId" = 39; -- Batman Returns
UPDATE movies SET images = '["batman-forever"]' WHERE "movieId" = 40; -- Batman Forever
UPDATE movies SET images = '["batman-begins"]' WHERE "movieId" = 41; -- Batman Begins

-- ------- Events -------
UPDATE events SET image = 'spindel-man' WHERE "eventId" IN (10, 16); -- Spindelveckan, Spindelmannens vecka
UPDATE events SET image = 'batman' WHERE "eventId" = 11; -- Mörkrets riddare
UPDATE events SET image = 'avengers-doomsday' WHERE "eventId" = 12; -- Avengers Assemble

COMMIT;
