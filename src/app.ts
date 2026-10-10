import { buildContainer } from "./main/container.js";
import { createApp } from "./main/create-app.js";

export const app = createApp(buildContainer());
