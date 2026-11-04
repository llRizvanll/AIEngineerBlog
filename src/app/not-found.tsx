import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "80px 20px", minHeight: "60vh" }}>
      <div className="kicker">404</div>
      <h1 style={{ fontSize: 56, fontWeight: 900, margin: "12px 0 16px" }}>This page was killed by the OS.</h1>
      <p style={{ color: "var(--muted)", fontSize: 20 }}>Nothing was saved to disk here. Let’s resume somewhere else.</p>
      <div className="btns" style={{ marginTop: 24 }}>
        <Link className="btn" href="/">
          Go home →
        </Link>
        <Link className="btn ghost" href="/aiengine">
          Open the curriculum
        </Link>
      </div>
    </main>
  );
}
