"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", padding: "4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem" }}>The archive itself faltered.</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>A critical error occurred. Please reload.</p>
        <button
          onClick={() => reset()}
          style={{ marginTop: "1.5rem", padding: "0.5rem 1.25rem", borderRadius: "0.375rem", background: "#5b3fb6", color: "white", border: "none", cursor: "pointer" }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
