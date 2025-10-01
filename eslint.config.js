import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    {
        ignores: ["server/views/landing.js"],
    },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
];
