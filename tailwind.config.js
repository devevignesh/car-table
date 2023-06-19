/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
				display: ["var(--font-satoshi)", "system-ui", "sans-serif"],
				default: ["var(--font-inter)", "system-ui", "sans-serif"],
			},
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
}
