"use server";

import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export const tokenProvider = async (userId: string) => {
    if (!apiKey) throw new Error("No API key");
    if (!apiSecret) throw new Error("No API secret");

    const client = new StreamClient(apiKey, apiSecret);

    // exp is optional (defaults to 1 hour)
    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;

    const token = client.createToken(userId, exp);

    return token;
};
