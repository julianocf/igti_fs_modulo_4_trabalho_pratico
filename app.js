import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { accountsRouter } from "./routes/accountsRouter.js";

dotenv.config().parsed;

//conectando ao mongoose
(async () => {
    try {
        await mongoose.connect(process.env.MONGODB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
    } catch (error) {
        console.log("Erro ao conectar ao MongoDB" + error);
    }
})();

const app = express();

app.use(express.json());
app.use(accountsRouter);

app.listen(3000, () => console.log("API Started."));
