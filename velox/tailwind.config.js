/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900 
        surfaceHover: '#27272a', // zinc-800
        primary: '#3b82f6', // blue-500
        primaryHover: '#2563eb', // blue-600
        accent: '#8b5cf6', // violet-500
        text: '#f4f4f5', // zinc-50
        textMuted: '#a1a1aa', // zinc-400
        border: '#3f3f46', // zinc-700
        success: '#10b981', // emerald-500
        warning: '#f59e0b', // amber-500
        danger: '#ef4444', // red-500
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.3)',
        'neon-blue': '0 0 15px rgba(59, 130, 246, 0.5)',
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
