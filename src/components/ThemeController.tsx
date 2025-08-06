import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark" | "spotify";

// Initialize theme on page load
function initializeTheme() {
	if (typeof window === "undefined") return;

	const savedTheme = localStorage.getItem("theme") as Theme;
	const root = document.documentElement;

	if (savedTheme && savedTheme !== "system") {
		root.setAttribute("data-theme", savedTheme);
	} else {
		root.removeAttribute("data-theme");
	}
}

// Call immediately when this module loads
initializeTheme();

export function ThemeController() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("theme") as Theme) || "system";
		}
		return "system";
	});

	useEffect(() => {
		const root = document.documentElement;

		if (theme === "system") {
			root.removeAttribute("data-theme");
			localStorage.removeItem("theme");
		} else {
			root.setAttribute("data-theme", theme);
			localStorage.setItem("theme", theme);
		}

		// Force a re-render by triggering a custom event
		window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
	}, [theme]);

	const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newTheme = e.target.value as Theme;
		console.log("Theme changing from", theme, "to", newTheme);
		setTheme(newTheme);
	};

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-theme-text-secondary">Theme:</span>
			<select
				value={theme}
				onChange={handleThemeChange}
				className="rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 bg-theme-bg-secondary border border-theme-border-primary text-theme-text-primary"
			>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="spotify">Spotify</option>
			</select>
		</div>
	);
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		if (typeof window !== "undefined") {
			return (localStorage.getItem("theme") as Theme) || "system";
		}
		return "system";
	});

	const updateTheme = (newTheme: Theme) => {
		const root = document.documentElement;

		if (newTheme === "system") {
			root.removeAttribute("data-theme");
			localStorage.removeItem("theme");
		} else {
			root.setAttribute("data-theme", newTheme);
			localStorage.setItem("theme", newTheme);
		}

		setTheme(newTheme);
	};

	return { theme, setTheme: updateTheme };
}
