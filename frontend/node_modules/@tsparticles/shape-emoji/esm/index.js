import { EmojiDrawer } from "./EmojiDrawer.js";
export async function loadEmojiShape(engine, refresh = true) {
    engine.checkVersion("3.9.1");
    await engine.addShape(new EmojiDrawer(), refresh);
}
