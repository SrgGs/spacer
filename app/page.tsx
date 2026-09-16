import type { Metadata } from "next";
import places from "./miejsca/places.json";

export const metadata: Metadata = {
  title: "Spacer po Zawierciu",
  description: "Lista dziewięciu punktów na trasie spaceru po Zawierciu.",
};

export default function Home() {
  return (
    <main className="page-shell">
      <section className="phone" aria-labelledby="page-title">
        <header className="app-header">
          <p className="eyebrow">Trasa spaceru</p>
          <h1 id="page-title">Zawiercie</h1>
          <p className="route-count">9 miejsc do odkrycia</p>
        </header>

        <ol className="places-list">
          {places.map((place) => (
            <li key={place.slug}>
              <a className="place-row" href={`/miejsca/${place.slug}/`} aria-label={`${place.number}. ${place.title}`}>
                <span className="place-number" aria-hidden="true">{place.number}</span>
                <span className="place-copy">
                  <strong>{place.title}</strong>
                  <small>{place.lead}</small>
                </span>
                <span className="open-label" aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
