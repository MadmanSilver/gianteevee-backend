import { Router, Request, Response, NextFunction } from "express";
import { exchangeCode, RefreshingAuthProvider } from "@twurple/auth";
import fs from 'fs';
import { asyncHandler } from "../utils/asyncHandler";

const clientId = process.env.TWITCH_CLIENT_ID!;
const clientSecret = process.env.TWITCH_CLIENT_SECRET!;
const redirectUri = process.env.TWITCH_REDIRECT_URI!;

const userFiles: Array<string> = ['./tokens.52527373.json'];

const authProvider = new RefreshingAuthProvider(
    {
        clientId,
        clientSecret,
        redirectUri,
    }
);

authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFileSync(`./tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'utf-8'));

for (let i = 0; i < userFiles.length; i++) {
    authProvider.addUserForToken(JSON.parse(fs.readFileSync(userFiles[i], 'utf-8')));
};

const router = Router();

router.get('/twitch/callback', asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const code = req.query.code as string;

    if (!code) {
        res.status(400).send('Missing OAuth code.');
        return;
    }

    try {
        console.log("CLIENT_ID: ", clientId);
        const tokenData = await exchangeCode(clientId, clientSecret, code, redirectUri);
        const userId = await authProvider.addUserForToken(tokenData);
        res.redirect('http://localhost:5173/');
        fs.writeFileSync(`./tokens.${userId}.json`, JSON.stringify(tokenData, null, 4));
    } catch (error) {
        console.error('Error adding user to AuthProvider via OAuth code:', error);
        next(error);
    }
}));

export default router;