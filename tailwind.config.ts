import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				theme: {
					bg: {
						primary: 'rgb(var(--color-bg-primary))',
						secondary: 'rgb(var(--color-bg-secondary))',
						tertiary: 'rgb(var(--color-bg-tertiary))',
						hover: 'rgb(var(--color-bg-hover))',
					},
					text: {
						primary: 'rgb(var(--color-text-primary))',
						secondary: 'rgb(var(--color-text-secondary))',
						tertiary: 'rgb(var(--color-text-tertiary))',
						muted: 'rgb(var(--color-text-muted))',
					},
					border: {
						primary: 'rgb(var(--color-border-primary))',
						secondary: 'rgb(var(--color-border-secondary))',
					},
					accent: {
						primary: 'rgb(var(--color-accent-primary))',
						hover: 'rgb(var(--color-accent-hover))',
						text: 'rgb(var(--color-accent-text))',
					},
					error: {
						DEFAULT: 'rgb(var(--color-error))',
						hover: 'rgb(var(--color-error-hover))',
					},
				},
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
