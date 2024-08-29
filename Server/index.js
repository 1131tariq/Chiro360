import express from "express"; // application
import morgan from "morgan"; // logger
import bodyParser from "body-parser"; //parser
import env from "dotenv";
import pg from "pg"; //Database
import bcrypt from "bcrypt"; //Encryption and Hashing
import session from "express-session"; // Session & Cookie Management
import passport from "passport"; //Authentication
import { Strategy } from "passport-local"; //Authentication Strategy
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";

//constants
const app = express();
const port = 8000;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const saltRounds = 6;
env.config();

//Websocket connection and data exchange
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", (message) => {
    console.log("Received message:", message);
    ws.send(JSON.stringify({ message: "Message received" }));
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

const sendDataUpdate = async (user, eventType, query, params = []) => {
  let filterCondition = "";
  let additionalParams = [];

  // Determine branch filtering based on permission level
  if (user.permission_level !== "System Admin") {
    // The branch filter is applied only if the user is not a System Admin
    if (eventType !== "soaps" && eventType !== "cpt_codes") {
      filterCondition += `WHERE branch_id = $${params.length + 1}`;
      additionalParams.push(user.branch_id);
    }
  }

  // Apply additional filters based on user_kind
  switch (user.user_kind) {
    case "Administrative only":
      break;

    case "Call Agent":
      break;

    default:
      // For Medical Staff and other providers
      if (
        user.permission_level !== "Location Admin" &&
        user.permission_level !== "System Admin"
      ) {
        if (eventType === "appointments") {
          filterCondition += filterCondition
            ? ` AND provider_id = $${
                params.length + additionalParams.length + 1
              }`
            : `WHERE provider_id = $${
                params.length + additionalParams.length + 1
              }`;
          additionalParams.push(user.id);
        } else if (eventType === "patients") {
          filterCondition += filterCondition
            ? ` AND assigned_doctor = $${
                params.length + additionalParams.length + 1
              }`
            : `WHERE assigned_doctor = $${
                params.length + additionalParams.length + 1
              }`;
          additionalParams.push(user.id);
        } else if (eventType === "soaps") {
          filterCondition += filterCondition
            ? ` AND provider_id = $${
                params.length + additionalParams.length + 1
              }`
            : `WHERE provider_id = $${
                params.length + additionalParams.length + 1
              }`;
          additionalParams.push(user.id);
        }
      }
      break;
  }

  // Construct the filtered query
  const filteredQuery = `${query} ${filterCondition}`;
  const filteredParams = [...params, ...additionalParams];

  try {
    // Execute the filtered query
    const result = await db.query(filteredQuery, filteredParams);
    const data = result.rows;

    // Prepare the message with the event type and data
    const message = {
      type: eventType,
      data: data,
    };

    // Send data to all connected WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });

    // Return the filtered data
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { success: false, error: err };
  }
};

//Postgres server Database connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

//Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(morgan("combined")); //Logger
app.use(bodyParser.urlencoded({ extended: true })); //Body Parser
app.use(express.static("./public")); //Static file midlleware

//Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, //If server goes down I can save sessions to server if need be
    saveUninitialized: true, //Force saving sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, //How long cookie lasts
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

//API Routes
app.post("/execute-query", async (req, res) => {
  if (req.isAuthenticated()) {
    const { query, params, dataType } = req.body;

    // Basic validation to prevent dangerous queries
    if (
      !query ||
      typeof query !== "string" ||
      query.includes(";--") ||
      query.includes("DROP")
    ) {
      return res.sendStatus(400); // Bad Request if query is invalid
    }

    try {
      await db.query(query, params || []);

      // Fetch and filter data using sendDataUpdate
      const updateResult = await sendDataUpdate(
        req.user,
        dataType,
        `SELECT * FROM ${dataType}`,
        []
      );

      if (updateResult.success) {
        return res.json(updateResult.data); // Return the filtered data
      } else {
        console.log("event failed: " + dataType);
        return res.sendStatus(500); // Internal Server Error if sendDataUpdate failed
      }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500); // Internal Server Error
    }
  } else {
    console.log("User is not authenticated");
    return res.sendStatus(401); // Unauthorized if not authenticated
  }
});

app.post("/register", async (req, res) => {
  if (!req.isAuthenticated()) {
    // If the user is not authenticated, respond with 401 Unauthorized
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    username,
    firstname,
    lastname,
    email,
    password,
    phone,
    address,
    userKind,
    permissionLevel,
    branch,
    title,
    permissions,
  } = req.body;
  try {
    // Check if user already exists by email or username
    const checkQuery = `
      SELECT * FROM users
      WHERE email = $1 OR username = $2
    `;
    const checkValues = [email, username];
    const checkResult = await db.query(checkQuery, checkValues);

    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email is already in use." });
      }
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Username is already taken." });
      }
    } else {
      // Hash the password
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        } else {
          // Insert new user into the database
          const contactinfo = {
            phone: phone,
            address,
          };
          const result = await db.query(
            "INSERT INTO users (username, firstname, lastname, email, password, contactinfo, user_kind, permission_level, branch_id, title, permissions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, username, firstname, lastname, email",
            [
              username,
              firstname,
              lastname,
              email,
              hash,
              contactinfo,
              userKind,
              permissionLevel,
              branch,
              title,
              permissions,
            ]
          );
          const user = result.rows[0];

          // Notify all WebSocket clients with updated user list
          await sendDataUpdate(req.user, "users", "SELECT * FROM users", []); // Send user list update

          // Respond with status 201 Created
          res.status(201).json(user); // Respond with user data
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Login Route
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.sendStatus(500);
    }
    if (!user) {
      return res.sendStatus(401);
    }
    req.login(user, (err) => {
      if (err) {
        return res.sendStatus(500);
      }
      return res.sendStatus(200);
    });
  })(req, res, next);
});

//Logout Route
app.get("/logout", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  req.logout((err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

//User Verification Route
app.get("/auth/status", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.sendStatus(401);
  }
});

//Passport Authentication Strategy - Local Email Authentication
passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, result) => {
          if (err) {
            return cb(err);
          } else {
            if (result) {
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
