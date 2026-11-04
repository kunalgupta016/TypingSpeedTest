import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/content/guides";
export function generateStaticParams() { return guides.map(({ slug }) => ({ guide: slug })); }
export async function generateMetadata({ params }: { params: Promise<{ guide: string }> }): Promise<Metadata> { const { guide } = await params; const item = guides.find((entry) => entry.slug === guide); return item ? { title: item.title, description: item.text } : {}; }
export default async function GuidePage({ params }: { params: Promise<{ guide: string }> }) { const { guide } = await params; const item = guides.find((entry) => entry.slug === guide); if (!item) notFound(); return <main className="page-shell text-page"><p className="eyebrow">FINGERFOX FIELD GUIDE</p><h1>{item.title}</h1><p className="lead">{item.text}</p><div className="prose"><p>{item.body}</p><h2>Try it in a short session</h2><p>Pick a round that feels comfortable and give yourself permission to pause. The goal is a repeatable practice that feels good, not a perfect score.</p><p>FingerFox saves your run summary in your browser so you can notice how your own practice changes over time.</p></div><p style={{ marginTop: 32 }}><Link className="button button-outline" href="/games">Choose a practice game <span aria-hidden="true">↗</span></Link></p></main>; }
