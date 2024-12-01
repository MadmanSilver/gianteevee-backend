import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Twitch Bot Web Interface x2');
});

app.use((req: Request, res: Response) => {
    res.status(404);
    res.send(`<h1>Error 404: Resource not found</h1>`);
});

app.listen(port, () => {
    console.log(`[server]: Web interface is running on http://localhost:${port}`);
});