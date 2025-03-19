import 'module-alias/register';
import dotenv from 'dotenv'
dotenv.config();

import express from 'express'
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import logger from './utils/logger';
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// for checking which request i called and what this request contains
app.use((req, res, next) => {
    console.log("Request Received: ", {
        path: req.path,
        method: req.method,
        body: req.body
    });
    next();
})
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());

const port = process.env.PORT || 4545;
const DB_URI = process.env.MONGODB_URL!;

app.get("/", (_, res) => {
    res.status(200).json({ message: "TackComp backend is running" })
})

app.get("/health", (_, res) => {
    logger.info("Health check is happening");
    logger.info("logger is working correctly");
    logger.error("logger is working correctly");
    res.status(200).json({ status: "OK" });
});

app.use("*", (_, res) => {
    res.status(404).json({ message: "Resource not found" });
});

mongoose
    .connect(DB_URI)
    .then(async () => {
        logger.info("Connected to MongoDB");
    })
    .catch((error) => {
        logger.error("MongoDB connection error:", error);
        process.exit(1);
    });

app
    .listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    })
    .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            logger.error("Error: address already in use");
        } else {
            logger.error(err);
        }
    });

process.on("uncaughtException", (err: Error) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
    logger.error("Unhandled Rejection:", err);
    process.exit(1);
});

export default app;
