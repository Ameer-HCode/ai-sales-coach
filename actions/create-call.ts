"use server";

import { v4 as uuidv4 } from "uuid";

export async function createCallId() {
    return uuidv4();
}
