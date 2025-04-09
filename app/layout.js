import Head from "next/head";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="max-w-md mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-cente mb-6">Tablica Wyników</h1>
        </div>
        {children}
      </body>
    </html>
  );
}
