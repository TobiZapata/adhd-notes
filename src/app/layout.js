import "./globals.css";
import "@fontsource-variable/onest";

export const metadata = {
  title: "ADHD Notes",
  description:
    "Helpful notes and resources for ADHD management and support.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="font-onest">
        {children}
      </body>
    </html>
  );
}
