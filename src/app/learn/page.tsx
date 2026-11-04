import Link from "next/link";
import { guides } from "@/content/guides";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Typing Tips and Practice Guides", description: "Read practical typing tips to build accuracy, improve speed, find a steady rhythm, and practice comfortably.", path: "/learn" });
export default function LearnPage() { return <main className="page-shell"><div className="page-heading"><p className="eyebrow">A FRIENDLY FIELD GUIDE</p><h1>Get comfortable at the keyboard.</h1><p>Practical tips for making each practice session a little more useful.</p></div><div className="learn-grid">{guides.map((guide, i) => <Link href={`/learn/${guide.slug}`} key={guide.slug} className="panel learn-card"><span className="game-number">0{i + 1}</span><h2>{guide.title}</h2><p>{guide.text}</p><span className="text-link">Read guide →</span></Link>)}</div></main>; }
