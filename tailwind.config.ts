import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Background colors
				'bg-primary': 'rgb(var(--color-bg-primary))',
				'bg-secondary': 'rgb(var(--color-bg-secondary))',
				'bg-tertiary': 'rgb(var(--color-bg-tertiary))',
				'bg-hover': 'rgb(var(--color-bg-hover))',

				// Text colors
				'text-primary': 'rgb(var(--color-text-primary))',
				'text-secondary': 'rgb(var(--color-text-secondary))',
				'text-tertiary': 'rgb(var(--color-text-tertiary))',
				'text-muted': 'rgb(var(--color-text-muted))',

				// Border colors
				'border-primary': 'rgb(var(--color-border-primary))',
				'border-secondary': 'rgb(var(--color-border-secondary))',

				// Accent colors
				'accent-primary': 'rgb(var(--color-accent-primary))',
				'accent-hover': 'rgb(var(--color-accent-hover))',
				'accent-text': 'rgb(var(--color-accent-text))',

				// Error colors
				'error': 'rgb(var(--color-error))',
				'error-hover': 'rgb(var(--color-error-hover))',
			},
			boxShadow: {
				'theme-sm': 'var(--shadow-sm)',
				'theme-md': 'var(--shadow-md)',
				'theme-lg': 'var(--shadow-lg)',
			},
		},
	},
	plugins: [],
} satisfies Config;
