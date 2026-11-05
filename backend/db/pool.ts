import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(root, ".env") });

console.log("host", process.env.POSTGRES_HOST);

//BIGINT (in8)
// Anger egen parser för PostgreSQL-dataypen BIGINT (in8) som annars returneras som sträng
pg.types.setTypeParser(20, (value) => {
  const parsed = Number(value);

  if(!Number.isSafeInteger(parsed)) {
    throw new Error(`BIGINT-värdet är utanför säkert nummerintervall: ${value}`)
  }

  return parsed;
})

//NUMERIC
// Anger egen parser för PostgreSQL-dataypen NUMERIC
pg.types.setTypeParser(1700, (value) => {
  const parsed = Number(value);

  //förhindrar NaN och Infinity
  if(!Number.isFinite(parsed)) {
    throw new Error(`NOgiltigt NUMERIC-värde: ${value}`);
  }

  return parsed;
})

const requiredEnvVars = [
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_DATABASE",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

export const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 5,                        //max supabase anl
  idleTimeoutMillis: 30000,      //stäng ansl som inte anv efter tid
  connectionTimeoutMillis: 5000, //vid anslfel stäng efter tid
});

pool.on("error", (err) => { //Om ohanterat error inträffar
  console.error("Database error:", err.message);
});

pool.on("connect", (client) => {
  client.on("error", (err) => {
    console.error("Database error:", err.message);
  });
});
