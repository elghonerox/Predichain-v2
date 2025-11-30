import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Theme-aware colors using CSS variables
                'bg-primary': 'var(--bg-primary)',
                'bg-secondary': 'var(--bg-secondary)',
                'bg-elevated': 'var(--bg-elevated)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-muted': 'var(--text-muted)',
                'border-default': 'var(--border-default)',
                'border-subtle': 'var(--border-subtle)',
            },
        },
    },
    plugins: [],
};
export default config;
