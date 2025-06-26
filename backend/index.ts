import express from "express";
import cors from "cors";

import { User } from "@shared/types/user";

const app = express();
const port = 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  const exampleUser: User = {
    id: "123",
    name: "Test User",
    email: "test@example.com",
    password: "hashedPassword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  res.json(exampleUser);
});

app.get("/health", (_req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

const hehe = () => {
  console.log("hehe");
};
