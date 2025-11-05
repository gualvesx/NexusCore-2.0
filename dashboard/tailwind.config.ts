// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
    fontFamily: {
        // MUDANÇA AQUI: 'Inter' foi substituído por 'Montserrat'
        sans: ["Montserrat", "sans-serif"],
        // Mantemos 'Arvo' para os títulos especiais
        arvo: ["Arvo", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Usado como base para o gradiente
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // Azul
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Roxo
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Rosa/Magenta
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Adicionar cores específicas para o gradiente de fundo se necessário
        'deep-space': 'hsl(240, 60%, 4%)', // Preto azulado muito escuro
        'midnight-blue': 'hsl(230, 40%, 10%)', // Azul escuro
        'deep-purple': 'hsl(260, 40%, 12%)', // Roxo escuro
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "background-pan": { // Mantém a animação suave existente
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "gradient-shift": { // Nova animação para o gradiente principal
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        "fade-in-up": { // Animação de entrada mais elaborada
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
         "pulse-glow": { // Efeito de brilho pulsante
           '0%, 100%': { boxShadow: '0 0 15px 5px hsla(var(--primary), 0.2), 0 0 30px 10px hsla(var(--secondary), 0.1)' },
           '50%': { boxShadow: '0 0 30px 10px hsla(var(--primary), 0.3), 0 0 60px 20px hsla(var(--secondary), 0.2)' },
         },
         "subtle-rotate": { // Rotação sutil para ícones
            '0%, 100%': { transform: 'rotate(-3deg)' },
            '50%': { transform: 'rotate(3deg)' },
         }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "background-pan": "background-pan 15s ease infinite", // Mantém
        "gradient-shift": "gradient-shift 15s ease infinite", // Nova animação de gradiente
        "fade-in-up": "fade-in-up 0.8s ease-out forwards", // Nova animação de entrada
         "pulse-glow": "pulse-glow 4s ease-in-out infinite", // Animação de brilho
         "subtle-rotate": "subtle-rotate 5s ease-in-out infinite", // Animação de rotação
      },
      backgroundSize: {
        '400%': '400% 400%',
        '200%': '200% 200%', // Adicionar para a animação gradient-shift
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
