/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#030303', // deeper black for more contrast
        surface: '#0a0a0a', 
        surfaceHover: '#121212',
        primary: '#3b82f6', 
        primaryHover: '#2563eb', 
        accent: '#8b5cf6', 
        text: '#fafafa', 
        textMuted: '#888888',
        border: '#1f1f1f',
        success: '#10b981', 
        warning: '#f59e0b', 
        danger: '#ef4444', 
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        'premium-gradient': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'premium': '0 0 40px rgba(59, 130, 246, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
      }
    },
  },
  plugins: [],
}
