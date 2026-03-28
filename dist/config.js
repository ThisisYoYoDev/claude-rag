import { DEFAULT_CONFIG } from "@claude-rag/shared";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
function getConfigPath() {
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || `${process.env.HOME}/.claude`;
    return `${claudeDir}/plugins/claude-rag/config.json`;
}
export function loadConfig() {
    const path = getConfigPath();
    try {
        const raw = readFileSync(path, "utf-8");
        const parsed = JSON.parse(raw);
        // Deep merge with defaults
        return deepMerge(DEFAULT_CONFIG, parsed);
    }
    catch {
        return DEFAULT_CONFIG;
    }
}
export function saveConfig(config) {
    const path = getConfigPath();
    const dir = dirname(path);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(path, JSON.stringify(config, null, 2));
}
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] &&
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === "object") {
            result[key] = deepMerge(target[key], source[key]);
        }
        else {
            result[key] = source[key];
        }
    }
    return result;
}
//# sourceMappingURL=config.js.map