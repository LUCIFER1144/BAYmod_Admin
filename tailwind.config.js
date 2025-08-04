const { Content } = require("next/font/google");

/** @type {import { 'tailwindcss' }.Config}*/
module.exports = {
    Content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./page/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme:{
        extends: {},
    },
    Plugin: [],
}
