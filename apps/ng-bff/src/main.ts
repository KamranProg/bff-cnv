import 'dotenv/config';

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { APP_URL, COOKIE_SECURE } from './app/config';
import { routes } from './app/routes';

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS for dev; in prod prefer same-origin via reverse proxy
app.use(cors({ origin: APP_URL, credentials: true }));

app.use(routes);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(
    `BFF listening on http://localhost:${port} (cookies Secure=${COOKIE_SECURE})`
  );
});
