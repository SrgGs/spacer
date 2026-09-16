"use client";

import { useRef, useState } from "react";

type Image = {
  src: string;
  thumbnail?: string;
  alt: string;
  caption: string;
};

export default function PhotoGallery({ images, title }: { images: Image[]; title: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Image | null>(null);

  function openImage(image: Image) {
    setSelected(image);
    dialogRef.current?.showModal();
  }

  function closeImage() {
    dialogRef.current?.close();
  }

  return (
    <>
      <section className="photos" aria-labelledby="photos-title">
        <h2 id="photos-title">Zdjęcia</h2>
        <div className="photos-grid">
          {images.map((image, index) => (
            <figure className={index === 0 ? "photo photo-main" : "photo"} key={image.src}>
              <button type="button" onClick={() => openImage(image)} aria-label={`Powiększ zdjęcie: ${image.caption}`}>
                <img src={image.thumbnail ?? image.src} alt={image.alt} loading={index === 0 ? "eager" : "lazy"} />
                <span>Powiększ zdjęcie</span>
              </button>
            </figure>
          ))}
        </div>
      </section>

      <dialog
        className="photo-dialog"
        ref={dialogRef}
        aria-label={`Powiększone zdjęcie: ${title}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeImage();
        }}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="photo-dialog-content">
            <button className="dialog-close" type="button" onClick={closeImage}>Zamknij</button>
            <img src={selected.src} alt={selected.alt} />
          </div>
        )}
      </dialog>
    </>
  );
}
