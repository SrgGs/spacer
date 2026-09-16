import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders all nine stops on the walking route", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Zawierciański szlak historyczny<\/title>/i);
  assert.match(html, /9 miejsc do odkrycia/);
  assert.equal((html.match(/href="\/miejsca\//g) ?? []).length, 9);
  assert.match(html, /href="\/miejsca\/park-kosciuszki"/);
  assert.match(html, /property="og:image"/);
});

test("renders a complete place page with photos and route navigation", async () => {
  const response = await render("/miejsca/wiadukt");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Wiadukt i dawny przejazd/);
  assert.match(html, /Punkt\s*(?:<!-- -->)?5(?:<!-- -->)?\s*z 9/);
  assert.match(html, /Historia miejsca/);
  assert.match(html, /Powiększ zdjęcie/);
  assert.match(html, /Następny punkt/);
  assert.doesNotMatch(html, /[🏛️🌟👤📜]/u);
  assert.match(html, /Opracowanie:<!-- --> Radosław Famulski|Opracowanie: Radosław Famulski/);
});

test("keeps photos in the gallery and highlights video links", async () => {
  const response = await render("/miejsca/dworzec");
  const html = await response.text();
  assert.ok(html.indexOf("Historia miejsca") < html.indexOf("photos-grid"));
  assert.match(html, /class="video-link"/);
  assert.match(html, /Zobacz materiał wideo/);
  assert.match(html, /https:\/\/youtu\.be\/m5AyEnTEdFM/);
});

test("ships content and images for every place", async () => {
  const places = JSON.parse(await readFile(new URL("../app/miejsca/places.json", import.meta.url), "utf8"));
  const photoCounts = {
    dworzec: 4, "palacyk-holenderskiego": 5, "krwawy-piatek": 2,
    "kamienica-3-maja-3": 4, wiadukt: 4, "drukarnia-plomien": 4,
    bazylika: 5, "plac-stosika": 5, "park-kosciuszki": 6,
  };
  assert.equal(places.length, 9);
  for (const place of places) {
    assert.ok(place.paragraphs.join(" ").length > 500, `${place.slug} should have substantial content`);
    assert.ok(photoCounts[place.slug] > 0, `${place.slug} should have at least one image`);
    for (let index = 1; index <= photoCounts[place.slug]; index += 1) {
      const number = String(index).padStart(2, "0");
      await access(new URL(`../public/historia/${place.slug}/${number}.jpg`, import.meta.url));
      await access(new URL(`../public/historia/${place.slug}/${number}-thumb.jpg`, import.meta.url));
    }
    const files = await readdir(new URL(`../public/historia/${place.slug}/`, import.meta.url));
    assert.equal(files.length, photoCounts[place.slug] * 2);
  }
});
