/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paymentUpi: "#10B981",
        paymentCard: "#3B82F6",
        paymentCash: "#F59E0B",
      },
    },
  },
  plugins: [],
}

