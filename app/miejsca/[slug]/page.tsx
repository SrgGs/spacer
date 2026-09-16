/* eslint-disable @next/next/no-html-link-for-pages -- Static Pages export needs full document navigation. */
import type { Metadata } from "next";
import placesData from "../places.json";
import PhotoGallery from "./PhotoGallery";

type Place = (typeof placesData)[number];
type StorySection = { heading: string; paragraphs: string[]; items?: string[]; afterItems?: string[] };

const places = placesData as Place[];

const videos: Record<string, { url: string; label: string }> = {
  dworzec: { url: "https://youtu.be/m5AyEnTEdFM", label: "Cała historia kolei w Zawierciu" },
  "kamienica-3-maja-3": { url: "https://youtu.be/Y3Z9pSONCeg", label: "Historia UB w Zawierciu" },
  wiadukt: { url: "https://youtu.be/mhhvNywdMHc", label: "Historia budowy wiaduktu i trasy WZ" },
  "park-kosciuszki": { url: "https://youtu.be/m5AyEnTEdFM", label: "Historia Parku im. Tadeusza Kościuszki" },
};

function getPlace(slug: string) {
  return places.find((place) => place.slug === slug);
}

function readableParagraphs(paragraphs: string[], videoUrl?: string) {
  return paragraphs.flatMap((rawParagraph) => {
    const paragraph = rawParagraph
      .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
      .replace(/https:\/\/youtu\.be\/\s+/g, "https://youtu.be/")
      .replace(videoUrl ?? "__no_video_url__", "")
      .replace(/^[„“”\s]+|[„“”\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (paragraph.length < 760) return [paragraph];
    const sentences = paragraph.match(/[^.!?]+[.!?]+(?:[”"»])?|[^.!?]+$/g) ?? [paragraph];
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if (current && current.length + sentence.length > 680) {
        chunks.push(current.trim());
        current = "";
      }
      current += sentence;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  });
}

export function generateStaticParams() {
  return places.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  return place
    ? { title: `${place.title} | Zawierciański szlak historyczny`, description: place.lead }
    : { title: "Miejsce | Zawierciański szlak historyczny" };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = getPlace(slug);

  if (!place) {
    return (
      <main className="page-shell"><section className="phone missing-place"><h1>Nie znaleziono miejsca</h1><a href="/">Wróć do trasy</a></section></main>
    );
  }

  const video = videos[place.slug];
  const sections = (place as Place & { sections?: StorySection[] }).sections;
  const storySections = sections
    ? sections.map((section) => ({
        heading: section.heading,
        paragraphs: readableParagraphs(section.paragraphs, video?.url),
        items: section.items,
        afterItems: section.afterItems && readableParagraphs(section.afterItems, video?.url),
      }))
    : [{ heading: "Historia miejsca", paragraphs: readableParagraphs(place.paragraphs, video?.url), items: undefined, afterItems: undefined }];
  const previous = places[place.number - 2];
  const next = places[place.number];

  return (
    <main className="page-shell detail-shell">
      <article className="phone detail-phone">
        <header className="detail-header">
          <a className="back-link" href="/">Wróć do trasy</a>
          <span className="detail-badge">Punkt {place.number} z 9</span>
          <p className="eyebrow">Zawierciański szlak historyczny</p>
          <h1>{place.title}</h1>
        </header>

        <div className="story-content">
          <section className="story-text" aria-labelledby="history-title">
            <h2 id="history-title" className="sr-only">Historia miejsca</h2>
            {storySections.map((section) => (
              <section className="story-section" key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
                {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
                {section.afterItems?.map((paragraph, index) => <p key={`after-${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>)}
              </section>
            ))}
          </section>

          {video && (
            <a className="video-link" href={video.url} target="_blank" rel="noreferrer">
              <strong>Zobacz materiał wideo</strong>
              <span>{video.label}</span>
            </a>
          )}

          <PhotoGallery images={place.images} title={place.title} />

          <nav className="route-nav" aria-label="Nawigacja między punktami trasy">
            {previous ? <a href={`/miejsca/${previous.slug}/`}><span>Poprzedni punkt</span><strong>{previous.title}</strong></a> : <span />}
            {next ? <a className="route-next" href={`/miejsca/${next.slug}/`}><span>Następny punkt</span><strong>{next.title}</strong></a> : <a className="route-next" href="/"><span>Koniec trasy</span><strong>Wróć do listy</strong></a>}
          </nav>

          <footer className="story-footer">
            <p>Opracowanie: Radosław Famulski</p>
            <p>@Ciekawa Przeszłość · Zawiercie, 2026 r.</p>
          </footer>
        </div>
      </article>
    </main>
  );
}
