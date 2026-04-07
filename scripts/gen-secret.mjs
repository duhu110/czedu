import { randomBytes } from "node:crypto";
console.log("Your new JWT_SECRET:");
console.log(randomBytes(32).toString("base64"));
