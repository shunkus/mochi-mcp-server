export const metadata = {
  title: "Mochi MCP Server",
  description: "MCP Server for Mochi Cards - Create and manage flashcards via AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
