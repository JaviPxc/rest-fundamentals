import * as dotenv from "dotenv";
import express from "express";
import { notFoundHandler } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { routes } from "./features/routes";
import swaggerUi from "swagger-ui-express";
import xmlparser from "express-xml-bodyparser";
import cors from "cors";

dotenv.config();

if (!process.env.PORT) {
  throw new Error("Missing required environment variables");
}

const PORT = parseInt(process.env.PORT, 10);
const app = express();

app.use(express.json());
app.use(xmlparser({ explicitArray: false, explicitRoot: false }));

// configure cors
app.use(cors());

// register routes
app.use("/", routes);

// configure swagger
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      {
        url: "/open_api_v1.json",
        name: "v1",
      },
      {
        url: "/open_api_v2.json",
        name: "v2",
      },
    ],
  },
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));

// register middleware
app.use(express.static("public"));
app.use(errorHandler);
app.use(notFoundHandler);

// start server
app.listen(PORT, () =>
  console.log(`Server ready at: http://localhost:${PORT}`)
);
