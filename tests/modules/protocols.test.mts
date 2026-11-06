/* Runs each protocol decoder against the exact bytes shown on that protocol's page. */
import fs from "node:fs";
import { parseDhcp } from "../../src/content/protocol-code/dhcp.ts";
import { parseIpv4, forward, internetChecksum } from "../../src/content/protocol-code/ip.ts";
import { echoRequest, parseIcmp } from "../../src/content/protocol-code/icmp.ts";
import { parseUdp, queryWithRetry } from "../../src/content/protocol-code/udp.ts";
import { parseDns, encodeName } from "../../src/content/protocol-code/dns.ts";
import { parseTcp, nextSeq } from "../../src/content/protocol-code/tcp.ts";
import { parseClientHello } from "../../src/content/protocol-code/tls.ts";
import { parseRequest, keepAlive } from "../../src/content/protocol-code/http.ts";
import { parseRecord, recordNonce } from "../../src/content/protocol-code/https.ts";
import { parseReply, dotStuff } from "../../src/content/protocol-code/smtp.ts";
import { parseStat, parsePop3, Mailbox } from "../../src/content/protocol-code/pop3.ts";
import { Session, parseImapLine } from "../../src/content/protocol-code/imap.ts";
import { parsePasv, replyClass } from "../../src/content/protocol-code/ftp.ts";
import { parseBanner, parsePacket, paddingFor } from "../../src/content/protocol-code/ssh.ts";

const protocols = JSON.parse(fs.readFileSync("src/content/protocols.json", "utf8"));
const hex = (x: string) => Uint8Array.from(x.match(/../g) ?? [], (h) => parseInt(h, 16));
const packet = (id: string, tab = 0) => {
  const p = protocols.find((x: { id: string }) => x.id === id).packets[tab];
  return hex(p.fields.map((f: { x: string }) => f.x).join(""));
};
const field = (id: string, tab: number, name: string) => {
  const f = protocols.find((x: { id: string }) => x.id === id).packets[tab].fields.find((y: { n: string }) => y.n === name);
  return new TextDecoder().decode(hex(f.x));
};

let passed = 0;
const failed: string[] = [];
function check(ok: boolean, name: string) {
  if (ok) passed++;
  else failed.push(name);
}

const d = parseDhcp(packet("dhcp"));
check(d.messageType === "DISCOVER" && d.isRequest, "dhcp: reads DISCOVER");
check(d.mac === "00:0c:29:3e:1c:9a" && d.xid === 0x3903f326 && d.wantsBroadcast, "dhcp: reads MAC, xid and broadcast flag");

const ip = parseIpv4(packet("ip"));
check(ip.version === 4 && ip.headerLength === 20 && ip.ttl === 64 && ip.protocol === 1, "ip: reads version, length, ttl, protocol");
check(ip.source === "192.168.1.10" && ip.destination === "8.8.8.8" && ip.dontFragment, "ip: reads addresses and DF");
check(ip.checksumOk, "ip: the page's header checksum is valid");
const hop = forward(packet("ip"));
check(!hop.dropped && hop.header[8] === 63 && parseIpv4(hop.header).checksumOk, "ip: forwarding lowers TTL and keeps the checksum valid");
const dying = packet("ip"); dying[8] = 1;
check(forward(dying).dropped, "ip: TTL 1 gets dropped");
check(internetChecksum(hex("00010002")) === 0xfffc, "ip: checksum arithmetic");

const ic = parseIcmp(packet("icmp"));
check(ic.type === 8 && ic.id === 0x1234 && ic.seq === 1, "icmp: reads the echo request");
check(ic.checksumOk, "icmp: the page's checksum is valid");
const built = echoRequest(0x1234, 1, new TextEncoder().encode("abcdefgh"));
check(parseIcmp(built).checksumOk && built.length === 16, "icmp: a built packet has a valid checksum");

const u = parseUdp(packet("udp"));
check(u.sourcePort === 0xcd86 && u.destinationPort === 53 && u.length === 37 && u.payload.length === 29, "udp: reads ports and payload");
let tries = 0;
check((await queryWithRetry(async () => (++tries === 3 ? "answer" : null))) === "answer" && tries === 3, "udp: retries until answered");
check((await queryWithRetry(async () => null)) === null, "udp: gives up after the limit");
const ud = parseDns(u.payload);
check(ud.questions[0].name === "example.com", "udp: its payload is the DNS query");

const q = parseDns(packet("dns", 0));
check(!q.isResponse && q.wantsRecursion && q.id === 0x1a2b, "dns: reads the query header");
check(q.questions[0].name === "example.com" && q.questions[0].type === 1, "dns: reads the question");
const r = parseDns(packet("dns", 1));
check(r.isResponse && r.rcode === 0 && r.answers.length >= 1, "dns: reads the response");
check(r.answers[0].name === "example.com" && r.answers[0].address !== null, "dns: follows the compression pointer");
check(encodeName("example.com").length === 13, "dns: encodes a name");

const t = parseTcp(packet("tcp", 0));
check(t.flags.join() === "SYN" && t.destinationPort === 443 && t.headerLength === 40, "tcp: reads SYN");
check(t.options.mss === 1460 && t.options.windowScale === 7 && t.options.sackPermitted === true, "tcp: reads options");
const sa = parseTcp(packet("tcp", 1));
check(sa.flags.includes("SYN") && sa.flags.includes("ACK") && sa.ack === nextSeq(t.seq, 0, t.flags), "tcp: SYN-ACK acknowledges seq + 1");
check(nextSeq(0xffffffff, 1, []) === 0, "tcp: sequence numbers wrap");

const ch = parseClientHello(packet("tls", 0));
check(ch.serverName === "example.com", "tls: finds the server name");
check(ch.suites[0] === 0x1301 && ch.offersTls13, "tls: finds suites and TLS 1.3");

const req = parseRequest(new TextDecoder().decode(packet("http", 0)));
check(req.method === "GET" && req.target === "/index.html" && req.headers.get("host") === "example.com", "http: parses the request");
check(keepAlive(req), "http: HTTP/1.1 keeps the connection by default");
check(parseRequest("POST / HTTP/1.1\r\nContent-Length: 2\r\n\r\nhi!").body === "hi", "http: reads exactly Content-Length bytes");

const rec = parseRecord(packet("https", 0));
check(rec.type === 23 && rec.tag.length === 16 && rec.length === rec.ciphertext.length + 16, "https: splits ciphertext and tag");
const iv = new Uint8Array(12).fill(1);
check(recordNonce(iv, 0n).every((x, i) => x === iv[i]) && recordNonce(iv, 1n)[11] === 0, "https: the nonce changes with the sequence");

const srv = protocols.find((x: { id: string }) => x.id === "smtp").packets[1];
const firstReply = new TextDecoder().decode(hex(srv.fields[0].x));
check(parseReply(firstReply).code >= 200, "smtp: parses the page's reply");
check(!parseReply("250-first\r\n").complete && parseReply("250-first\r\n250 last\r\n").complete, "smtp: multi-line replies");
check(parseReply("421 busy\r\n").retryLater && !parseReply("550 no\r\n").retryLater, "smtp: 4xx retries, 5xx does not");
check(dotStuff(".hi") === "..hi\r\n.\r\n", "smtp: dot-stuffing");

check(parseStat(field("pop3", 0, "STAT reply")).messages === 2 && parseStat(field("pop3", 0, "STAT reply")).bytes === 5120, "pop3: parses STAT");
check(parsePop3(field("pop3", 0, "Greeting")).ok && !parsePop3("-ERR no").ok, "pop3: +OK and -ERR");
const box = new Mailbox([1, 2]); box.dele(1); box.rset(); box.dele(2);
check(box.quit().join() === "1", "pop3: deletes apply at QUIT, and RSET undoes them");

check(parseImapLine(field("imap", 0, "Untagged data")).kind === "untagged", "imap: reads an untagged line");
const tagged = parseImapLine(field("imap", 0, "Tagged reply"));
check(tagged.kind === "tagged" && tagged.tag === "a001", "imap: reads a tagged line");
const sess = new Session();
check(sess.send("SELECT INBOX") === "a001 SELECT INBOX\r\n", "imap: tags commands");
check(sess.receive("* 3 EXISTS") === null, "imap: untagged data waits for its command");
const done = sess.receive("a001 OK done");
check(done?.status === "OK" && done.data[0] === "3 EXISTS", "imap: the tagged reply collects the data");

const pasv = parsePasv(field("ftp", 0, "PASV reply").trim());
check(pasv.port > 1023 && pasv.host.split(".").length === 4, "ftp: decodes the page's PASV reply");
check(parsePasv("227 x (192,0,2,1,195,80)").port === 50000, "ftp: port is p1 * 256 + p2");
check(replyClass(150) === "wait" && replyClass(226) === "done" && replyClass(550) === "failed", "ftp: reply classes");

check(parseBanner(field("ssh", 0, "Identification")).protocol === "2.0", "ssh: parses the page's banner");
const kex = parsePacket(packet("ssh", 1));
check(kex.messageType === 20, "ssh: finds KEXINIT");
check((4 + 1 + 100 + paddingFor(100)) % 8 === 0 && paddingFor(100) >= 4, "ssh: padding aligns the packet");

if (failed.length) {
  failed.forEach((f) => console.log("  FAILED", f));
  process.exit(1);
}
console.log(`${passed} protocol checks passed`);
