import Link from "next/link";
import type { Metadata } from "next";
import { PROTOCOLS } from "@/lib/content";
import { hexs } from "@/components/protocols/hex";
import { DoneMark } from "@/components/protocols/ProtocolLesson";

export const metadata: Metadata = { title: "Protocol Explorer", description: "Fourteen protocols decoded packet by packet." };

const LAYERS: [string, string][] = [
  ["Application", "What programs say to each other"],
  ["Transport", "Ports, reliability and flow"],
  ["Internet", "Addresses and routing"],
];
const JOURNEY: [string, string, string][] = [
  ["dhcp", "Get an address", "The laptop joins Wi-Fi and leases 192.168.1.50."],
  ["dns", "Find the server", "example.com becomes 93.184.216.34."],
  ["tcp", "Open a connection", "Three packets agree sequence numbers."],
  ["tls", "Secure it", "Keys are agreed; the certificate is checked."],
  ["http", "Ask for the page", "GET / and a 200 OK come back."],
];

export default function ProtocolsIndex() {
  return (
    <main className="view pe pe-page" id="view-proto">
      <div className="pe-wrap">
        <section className="pe-hero">
          <div className="pe-kick">Protocol Explorer</div>
          <h1>
            Watch the internet work, <em>packet by packet.</em>
          </h1>
          <p>
            Fourteen interactive lessons. Every packet is decoded byte by byte, so you can see exactly what DHCP, DNS, TCP, TLS, HTTP and the rest
            put on the wire.
          </p>
          <div className="pe-cta">
            <Link className="pe-btn" href="/protocols/dhcp">
              Start the journey →
            </Link>
            <Link className="pe-btn ghost" href="/protocols/tcp">
              Jump to TCP
            </Link>
          </div>
          <div className="pe-hex" aria-hidden>
            {"45 00 00 54 1c 46 40 00 40 01 b3 4e c0 a8 01 0a".split(" ").map((h, i) => (
              <span key={i}>{h}</span>
            ))}
          </div>
        </section>
        <h2 className="pe-h">One page load, end to end</h2>
        <div className="pe-journey stagger">
          {JOURNEY.map(([id, t, s], i) => (
            <Link key={id} href={`/protocols/${id}`}>
              <b>{i + 1}</b>
              <span className="n">{id.toUpperCase()}</span>
              <strong>{t}</strong>
              <small>{s}</small>
            </Link>
          ))}
        </div>
        <h2 className="pe-h">The layers</h2>
        <div className="pe-layers">
          {LAYERS.map(([l, d]) => (
            <div key={l}>
              <h3>
                {l}
                <small>{d}</small>
              </h3>
              <div className="chips">
                {PROTOCOLS.filter((p) => p.layer === l).map((p) => (
                  <Link key={p.id} href={`/protocols/${p.id}`}>
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <h2 className="pe-h">
          All protocols <span>{PROTOCOLS.length} lessons</span>
        </h2>
        <div className="pe-grid stagger">
          {PROTOCOLS.map((d, i) => {
            const strip: { h: string; c: number }[] = [];
            d.packets[0].fields.forEach((f, k) => hexs(f.x).slice(0, 3).forEach((h) => strip.push({ h, c: k % 8 })));
            return (
              <Link key={d.id} className="pe-card" href={`/protocols/${d.id}`}>
                <div className="top">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`lay l-${d.layer}`}>{d.layer}</span>
                  <DoneMark id={d.id} />
                </div>
                <h3>{d.name}</h3>
                <p>{d.tag}</p>
                <div className="pe-strip" aria-hidden>
                  {strip.slice(0, 14).map((b, k) => (
                    <i key={k} className={`c${b.c}`}>
                      {b.h}
                    </i>
                  ))}
                </div>
                <small>
                  {d.port} · {d.packets.reduce((a, p) => a + p.fields.length, 0)} fields decoded
                </small>
              </Link>
            );
          })}
        </div>
      </div>
      <footer className="pe-foot">AI Engineer · Protocol Explorer · packets shown are examples with computed checksums</footer>
    </main>
  );
}
