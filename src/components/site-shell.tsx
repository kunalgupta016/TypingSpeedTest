import Link from "next/link";
import { business } from "../../config/business";
import { Button } from "@/components/ui/button";

function isSet(value: string) { return !value.startsWith("PLACEHOLDER"); }

export function Header() {
  return <header className="site-header"><Link className="wordmark" href="/" aria-label="FingerFox home"><span className="fox-mark">f</span> fingerfox</Link><nav aria-label="Main navigation"><Link href="/games">Games</Link><Link href="/daily">Daily challenge</Link><Link href="/typing-test">Typing test</Link><Link href="/stats">My stats</Link><Link href="/learn">Learn</Link><Link href="/leaderboard">Leaderboard</Link><Link href="/settings">Settings</Link></nav><details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><nav aria-label="Mobile navigation"><Link href="/games">Games</Link><Link href="/daily">Daily challenge</Link><Link href="/typing-test">Typing test</Link><Link href="/stats">My stats</Link><Link href="/learn">Learn</Link><Link href="/leaderboard">Leaderboard</Link><Link href="/settings">Settings</Link></nav></details><Button asChild variant="outline" className="header-cta" iconRight={null}><Link href="/daily">Daily challenge</Link></Button></header>;
}

export function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div><Link className="wordmark" href="/"><span className="fox-mark">f</span> fingerfox</Link><p>Small practice, steady progress.</p>{isSet(business.legalName) && <p>{business.legalName}</p>}{isSet(business.address) && <p>{business.address}</p>}{isSet(business.contactEmail) && <p><a href={`mailto:${business.contactEmail}`}>{business.contactEmail}</a></p>}</div><div className="footer-links"><Link href="/about">About</Link><Link href="/faq">FAQs</Link><Link href="/contact">Contact</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/refund">Refunds</Link><Link href="/settings">Data settings</Link></div></div><div className="footer-bottom"><span>Free to play. Progress stays on this device.</span><span>© 2026 FingerFox</span></div></footer>;
}
