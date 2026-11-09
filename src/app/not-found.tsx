import Link from "next/link";
import { NOT_FOUND_COPY } from "@/content/pages/not-found";

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "80px 20px", minHeight: "60vh" }}>
      <div className="kicker">{NOT_FOUND_COPY.code}</div>
      <h1 style={{ fontSize: 56, fontWeight: 900, margin: "12px 0 16px" }}>{NOT_FOUND_COPY.title}</h1>
      <p style={{ color: "var(--muted)", fontSize: 20 }}>{NOT_FOUND_COPY.text}</p>
      <div className="btns" style={{ marginTop: 24 }}>
        <Link className="btn" href={NOT_FOUND_COPY.home.href}>
          {NOT_FOUND_COPY.home.label}
        </Link>
        <Link className="btn ghost" href={NOT_FOUND_COPY.curriculum.href}>
          {NOT_FOUND_COPY.curriculum.label}
        </Link>
      </div>
    </main>
  );
}
