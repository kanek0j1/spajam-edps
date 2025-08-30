/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.{js,jsx,ts,tsx}',                    // ← index を監視
    './TaskListScreen.{js,jsx,ts,tsx}',           // ← 直下にある画面
    './src/**/*.{js,jsx,ts,tsx}',                 // ← src 配下を使うなら
    // './app/**/*.{js,jsx,ts,tsx}',              // Expo Router を使うなら
  ],
  theme: { extend: {} },
  plugins: [],
};
