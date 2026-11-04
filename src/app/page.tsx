import Link from "next/link";
import { games } from "@/games/registry";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="page-shell home">
      <section className="hero">
        <div className="hero-copy">
          <span className="wordmark"><span className="fox-mark">f</span> fingerfox</span>
          <p className="eyebrow">A little practice goes a long way</p>
          <h1>Find your <em>typing rhythm.</em></h1>
          <p className="lead">Quick games, thoughtful practice, and progress that stays yours. No account needed to get started.</p>
          <div className="actions"><Link className="button button-primary" href="/games">Explore the games <span aria-hidden="true">↗</span></Link><Link className="button button-outline" href="/daily">Play today’s challenge</Link><Link className="button button-outline" href="/typing-test">Try a typing test</Link></div>
          <p className="quiet-note">Free to play · Progress saved on this device</p>
        </div>
        <div className="hero-card" aria-label="A sample typing practice card">
          <div className="card-top"><span>YOUR NEXT SESSION</span><span>Preview</span></div>
          <div className="sample-text"><span>small steps</span><b> build</b><span> steady hands</span></div>
          <div className="sample-divider" />
          <div className="sample-stats"><div><strong>2 min</strong><span>just enough time</span></div><div><strong>11 games</strong><span>different ways to play</span></div></div>
          <Link href="/games" className="card-link">Choose a game <span aria-hidden="true">→</span></Link>
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">PICK UP AND PLAY</p><h2>A practice for every mood</h2></div><Link href="/games" className="text-link">All games <span aria-hidden="true">→</span></Link></div>
        <div className="game-grid home-games">{games.slice(0, 3).map((game, i) => <Link href={`/games/${game.slug}`} className="game-card" key={game.slug}><span className="game-number">0{i + 1}</span><div><h3>{game.name}</h3><p>{game.shortDescription}</p></div><span className="game-arrow" aria-hidden="true">↗</span></Link>)}</div>
      </section>
      <Card className="callout"><div><p className="eyebrow">YOUR DATA, YOUR DEVICE</p><h2>Practice privately.</h2><p>Guest progress is stored in your browser. We don’t sell personal data or use advertising trackers.</p></div><Link className="button button-outline" href="/privacy">How privacy works <span aria-hidden="true">→</span></Link></Card>
    </main>
  );
}
