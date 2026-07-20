import React, { useEffect, useRef, useState } from "react";
import {
  aboutImage,
  editorials,
  heroImage,
  measurements,
  profile,
  reelFrames,
  works
} from "./data/portfolio";
import {
  useGalleryParallax,
  useHeroParallax,
  useInViewOnce,
  useMagnetic,
  useNavigationMotion,
  useReducedMotion,
  useRevealSystem,
  useViewportActive
} from "./hooks/motion";

const navItems = [
  ["Work", "#work", "work"],
  ["Editorial", "#editorial", "editorial"],
  ["About", "#about", "about"],
  ["Book", "#contact", "contact"]
];
const sectionIds = navItems.map(([, , id]) => id);
const galleryParallax = [-18, 14, -12, 18, -16, 12, -14, 16];

function Header({ menuOpen, setMenuOpen, reduced }) {
  const menuButton = useRef(null);
  const { activeSection, hidden } = useNavigationMotion(sectionIds, reduced);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeWithKeyboard = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButton.current?.focus());
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithKeyboard);
    };
  }, [menuOpen, setMenuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const headerClass = [
    "site-header",
    hidden && !menuOpen ? "is-hidden" : "",
    activeSection ? "is-scrolled" : ""
  ].filter(Boolean).join(" ");

  return (
    <header className={headerClass}>
      <a className="wordmark" href="#top" onClick={closeMenu} aria-label="Go to top">
        PP<span>®</span>
      </a>
      <nav
        className={menuOpen ? "primary-nav is-open" : "primary-nav"}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {navItems.map(([label, href, sectionId], index) => (
          <a
            href={href}
            key={label}
            onClick={closeMenu}
            className={activeSection === sectionId ? "is-active" : ""}
            aria-current={activeSection === sectionId ? "location" : undefined}
            style={{ "--nav-index": index }}
          >
            <span>{label}</span>
            <i>0{index + 1}</i>
          </a>
        ))}
      </nav>
      <button
        className="menu-toggle"
        type="button"
        ref={menuButton}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="primary-navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
      </button>
    </header>
  );
}

function Arrow({ direction = "right" }) {
  return <span className={"arrow arrow--" + direction} aria-hidden="true">↗</span>;
}

function LinesReveal({ lines, className = "" }) {
  return (
    <h2 className={"line-reveal " + className} data-reveal="lines">
      {lines.map((line, index) => (
        <span className="line-reveal__mask" key={index}>
          <span
            className="line-reveal__content"
            style={{ "--line-delay": index * 110 + "ms" }}
          >
            {line}
          </span>
        </span>
      ))}
    </h2>
  );
}

function HeroTitle() {
  const words = ["PHƯƠNG", "PHƯƠNG"];

  return (
    <h1 className="hero__heading" aria-label="Phương Phương" data-reveal="hero">
      {words.map((word, wordIndex) => (
        <span
          className={
            wordIndex === 1
              ? "hero__word hero__heading--offset"
              : "hero__word hero__word--primary"
          }
          key={word}
        >
          {[...word].map((character, characterIndex) => (
            <span
              className="hero__char"
              key={character + characterIndex}
              style={{ "--char-delay": wordIndex * 150 + characterIndex * 42 + "ms" }}
            >
              {character}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function ResponsiveImage({
  asset,
  alt,
  sizes,
  loading = "lazy",
  priority = false,
  className = ""
}) {
  return (
    <picture>
      <source type="image/webp" srcSet={asset.webpSrcSet} sizes={sizes} />
      <img
        className={className}
        src={asset.src}
        srcSet={asset.jpegSrcSet}
        sizes={sizes}
        width={asset.width}
        height={asset.height}
        alt={alt}
        loading={priority ? "eager" : loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
      />
    </picture>
  );
}

function MagneticLink({ children, className = "", reduced, ...props }) {
  const magneticRef = useRef(null);
  useMagnetic(magneticRef, reduced);

  return (
    <a ref={magneticRef} className={"magnetic " + className} {...props}>
      {children}
    </a>
  );
}

function MagneticButton({ children, className = "", reduced, ...props }) {
  const magneticRef = useRef(null);
  useMagnetic(magneticRef, reduced);

  return (
    <button ref={magneticRef} className={"magnetic " + className} {...props}>
      {children}
    </button>
  );
}

function WorkCard({ work, index, onOpen }) {
  return (
    <div
      className={"work-card-slot work-card--" + (index + 1)}
      data-reveal="card"
      data-parallax={galleryParallax[index]}
      style={{ "--stagger": index * 90 + "ms" }}
    >
      <div className="work-card__motion">
        <button
          className="work-card"
          type="button"
          onClick={onOpen}
        >
          <span className="work-card__image">
            <ResponsiveImage
              asset={work.image}
              alt={work.alt}
              sizes="(max-width: 760px) 100vw, (max-width: 1024px) 50vw, 40vw"
            />
          </span>
          <span className="work-card__details">
            <span>{work.category}</span>
            <strong>{work.title}</strong>
            <i>{work.id}</i>
          </span>
        </button>
      </div>
    </div>
  );
}

function AnimatedMeasurementValue({ value, reduced }) {
  const valueRef = useRef(null);
  const visible = useInViewOnce(valueRef, reduced, 0.65);
  const [numbers, setNumbers] = useState(null);
  const targets = (value.match(/\d+/g) || []).map(Number);

  useEffect(() => {
    if (!visible || reduced || targets.length === 0) return undefined;

    let frame = 0;
    const startedAt = window.performance.now();
    const duration = 920;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setNumbers(targets.map((target) => Math.round(target * eased)));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced, value, visible]);

  if (!numbers) return <dd ref={valueRef}>{value}</dd>;

  let numberIndex = 0;
  const content = value.split(/(\d+)/).map((part, index) => {
    if (!/^\d+$/.test(part)) return part;
    const currentNumber = numbers[numberIndex];
    numberIndex += 1;
    return <span className="measurement-counter" key={index}>{currentNumber}</span>;
  });

  return <dd ref={valueRef}>{content}</dd>;
}

function PressMarquee({ items }) {
  return (
    <div className="press-marquee" data-reveal="marquee">
      <p>Featured in</p>
      <div className="press-marquee__lane">
        <div className="press-marquee__track">
          {items.map((item) => (
            <a href={item.href} target="_blank" rel="noreferrer" key={item.label}>
              {item.label} <Arrow />
            </a>
          ))}
          {items.map((item) => (
            <span aria-hidden="true" key={"duplicate-" + item.label}>
              {item.label} <Arrow />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Lightbox({ lightbox, onClose, setLightbox }) {
  const closeButton = useRef(null);

  useEffect(() => {
    if (!lightbox) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") {
        setLightbox((current) => ({
          ...current,
          index: (current.index + 1) % current.items.length
        }));
      }
      if (event.key === "ArrowLeft") {
        setLightbox((current) => ({
          ...current,
          index: (current.index - 1 + current.items.length) % current.items.length
        }));
      }
      if (event.key === "Tab") {
        const controls = [...document.querySelectorAll(".lightbox button:not([disabled])")];
        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];

        if (!firstControl || !lastControl) return;
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
        }
        if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => closeButton.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightbox, onClose, setLightbox]);

  if (!lightbox) return null;
  const item = lightbox.items[lightbox.index];
  const count = String(lightbox.index + 1).padStart(2, "0");

  const navigate = (delta) => {
    setLightbox((current) => ({
      ...current,
      index: (current.index + delta + current.items.length) % current.items.length
    }));
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="lightbox__top">
        <p>{count} / {String(lightbox.items.length).padStart(2, "0")}</p>
        <button ref={closeButton} type="button" onClick={onClose}>
          Close <span>×</span>
        </button>
      </div>
      <button className="lightbox__previous" type="button" aria-label="Previous image" onClick={() => navigate(-1)}>←</button>
      <figure className="lightbox__figure">
        <ResponsiveImage
          asset={item.image}
          alt={item.alt}
          sizes="(max-width: 760px) 94vw, min(82vw, 1000px)"
          loading="eager"
        />
        <figcaption>
          <p id="lightbox-title">{item.title}</p>
          <span>{item.category || item.subtitle}</span>
        </figcaption>
      </figure>
      <button className="lightbox__next" type="button" aria-label="Next image" onClick={() => navigate(1)}>→</button>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [reelIndex, setReelIndex] = useState(0);
  const [bookingStatus, setBookingStatus] = useState("");
  const [bookingState, setBookingState] = useState("idle");
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || !document.hidden
  );
  const lightboxTrigger = useRef(null);
  const heroRef = useRef(null);
  const galleryRef = useRef(null);
  const reelRef = useRef(null);
  const reduced = useReducedMotion();
  const reelActive = useViewportActive(reelRef, reduced, 0.35);
  useRevealSystem(reduced);
  useHeroParallax(heroRef, reduced);
  useGalleryParallax(galleryRef, reduced);

  useEffect(() => {
    const syncPageVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", syncPageVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncPageVisibility);
    };
  }, []);

  useEffect(() => {
    if (reduced || !reelActive || !pageVisible || lightbox) return undefined;

    const timer = window.setInterval(() => {
      setReelIndex((current) => (current + 1) % reelFrames.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [lightbox, pageVisible, reduced, reelActive]);

  const openLightbox = (items, index, event) => {
    lightboxTrigger.current = event.currentTarget;
    setLightbox({ items, index });
  };

  const closeLightbox = () => {
    setLightbox(null);
    window.requestAnimationFrame(() => lightboxTrigger.current?.focus());
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = form.get("name");
    const project = form.get("project");
    const replyTo = form.get("email");
    const message = form.get("message");
    const subject = encodeURIComponent("Booking enquiry — " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\n" +
      "Email: " + replyTo + "\n" +
      "Project: " + project + "\n\n" +
      message
    );
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;

    if (!endpoint) {
      window.location.href = "mailto:" + profile.email + "?subject=" + subject + "&body=" + body;
      setBookingState("success");
      setBookingStatus("Your enquiry is ready in your email app.");
      return;
    }

    setBookingState("submitting");
    setBookingStatus("Sending your enquiry…");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ name, email: replyTo, project, message })
      });

      if (!response.ok) throw new Error("The booking request was not accepted.");

      formElement.reset();
      setBookingState("success");
      setBookingStatus("Thank you — your enquiry has been sent.");
    } catch {
      setBookingState("error");
      setBookingStatus("We could not send this form. Please use the email link instead.");
    }
  };

  return (
    <div className={menuOpen ? "app menu-is-open" : "app"}>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} reduced={reduced} />

      <main>
        <section className="hero" id="top" ref={heroRef}>
          <div className="hero__meta">
            <p>Based in Vietnam</p>
            <p>Model · Actress</p>
          </div>
          <div className="hero__content">
            <HeroTitle />
            <div className="hero__image-wrap">
              <div className="hero__image">
                <ResponsiveImage
                  asset={heroImage}
                  alt="Phương Phương in a floral editorial portrait"
                  sizes="(max-width: 760px) 61vw, 31vw"
                  priority
                />
              </div>
              <p className="hero__image-caption">01 / Visual portfolio</p>
            </div>
            <p className="hero__intro">
              A considered presence for fashion, beauty<br className="desktop-only" /> and commercial stories.
            </p>
          </div>
          <div className="hero__footer">
            <MagneticLink href="#work" className="text-link" reduced={reduced}>
              Explore selected work <Arrow />
            </MagneticLink>
            <p>2025—26</p>
          </div>
        </section>

        <section className="statement section-shell">
          <p className="eyebrow" data-reveal="eyebrow">01 — Selected work</p>
          <div className="statement__copy" data-reveal="copy">
            <p>Elegance in the pause. A visual practice shaped by <em>texture, movement</em> and quiet confidence.</p>
          </div>
        </section>

        <section className="works section-shell" id="work">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal="eyebrow">Selected work</p>
              <LinesReveal lines={[<>Studies in</>, <em>presence.</em>]} />
            </div>
            <p className="section-heading__aside" data-reveal="eyebrow">Click an image to view the full frame.</p>
          </div>
          <div className="work-grid" ref={galleryRef}>
            {works.map((work, index) => (
              <WorkCard
                work={work}
                index={index}
                key={work.id}
                onOpen={(event) => openLightbox(works, index, event)}
              />
            ))}
          </div>
          <a className="outline-link" href="#editorial">View all selected work <Arrow /></a>
        </section>

        <section className="editorial" id="editorial">
          <div className="section-shell editorial__heading">
            <p className="eyebrow" data-reveal="eyebrow">02 — Editorial series</p>
            <LinesReveal lines={[<>Visual narratives</>, <>in <em>three acts.</em></>]} />
          </div>
          <div className="editorial__track" aria-label="Editorial series">
            {editorials.map((editorial, index) => (
              <button
                className="editorial-card"
                type="button"
                key={editorial.number}
                onClick={(event) => openLightbox(editorials, index, event)}
                data-reveal="editorial-card"
                style={{ "--stagger": index * 130 + "ms" }}
              >
                <span className="editorial-card__image">
                  <ResponsiveImage
                    asset={editorial.image}
                    alt={editorial.alt}
                    sizes="(max-width: 760px) 79vw, 32vw"
                  />
                </span>
                <span className="editorial-card__meta">
                  <i>{editorial.number}</i>
                  <span>
                    <strong>{editorial.title}</strong>
                    <small>{editorial.subtitle}</small>
                  </span>
                  <Arrow />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="reel section-shell" aria-label="Visual reel">
          <div className="reel__media motion-image-block" data-reveal="image" ref={reelRef}>
            <ResponsiveImage
              key={reelFrames[reelIndex].image.src}
              asset={reelFrames[reelIndex].image}
              alt=""
              sizes="(max-width: 760px) 100vw, 90vw"
              className="reel__image"
            />
            <div className="reel__overlay">
              <p>Motion studies</p>
              <span>Image sequence / 00:18</span>
            </div>
            <div className="reel__dots" aria-label="Choose reel frame">
              {reelFrames.map((frame, index) => (
                <button
                  type="button"
                  aria-label={"Show frame " + (index + 1)}
                  aria-pressed={index === reelIndex}
                  className={index === reelIndex ? "is-active" : ""}
                  onClick={() => setReelIndex(index)}
                  key={frame.image.src}
                />
              ))}
            </div>
          </div>
          <div className="reel__caption" data-reveal="copy">
            <p className="eyebrow">03 — Showreel</p>
            <p>A visual sequence for fashion, beauty and movement.</p>
          </div>
        </section>

        <section className="about" id="about">
          <div className="about__image motion-image-block" data-reveal="image">
            <ResponsiveImage
              asset={aboutImage}
              alt="Phương Phương in a fashion editorial"
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
          <div className="about__content section-shell">
            <p className="eyebrow" data-reveal="eyebrow">04 — About</p>
            <LinesReveal lines={[<>Natural poise,</>, <em>held with intent.</em>]} />
            <div className="about__columns" data-reveal="copy">
              <div>
                <p>
                  Phương Phương is a Vietnam-based model and actress with a feeling for image,
                  character, and the details between them. Her work moves from beauty and fashion
                  editorials to commercial storytelling and camera-led performance.
                </p>
                <MagneticLink className="text-link" href={"mailto:" + profile.email} reduced={reduced}>
                  Book an enquiry <Arrow />
                </MagneticLink>
              </div>
              <dl className="measurements">
                {measurements.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <AnimatedMeasurementValue value={value} reduced={reduced} />
                  </div>
                ))}
              </dl>
            </div>
            <PressMarquee items={profile.press} />
          </div>
        </section>

        <section className="contact section-shell" id="contact">
          <div className="contact__intro">
            <p className="eyebrow" data-reveal="eyebrow">05 — Contact</p>
            <LinesReveal lines={[<>Let’s make</>, <>something <em>felt.</em></>]} />
            <div className="contact__direct">
              <a href={"mailto:" + profile.email}>{profile.email}</a>
              <a href={profile.instagram} target="_blank" rel="noreferrer">Instagram <Arrow /></a>
              <a href={profile.facebook} target="_blank" rel="noreferrer">Facebook <Arrow /></a>
            </div>
            <a className="comp-card-link" href="/comp-card-phuong-phuong.pdf" download>
              Download comp card (PDF) <Arrow />
            </a>
          </div>
          <form className="booking-form" onSubmit={submitBooking} data-reveal="copy">
            <label>
              <span>Your name</span>
              <input type="text" name="name" autoComplete="name" placeholder="Name" required />
            </label>
            <label>
              <span>Email address</span>
              <input type="email" name="email" autoComplete="email" placeholder="you@studio.com" required />
            </label>
            <label>
              <span>Project type</span>
              <select name="project" defaultValue="" required>
                <option value="" disabled>Select one</option>
                <option>Fashion / Editorial</option>
                <option>Beauty / E-commerce</option>
                <option>Commercial / TVC</option>
                <option>Acting / Appearance</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <span>Tell me about the project</span>
              <textarea name="message" rows="4" placeholder="Date, location, creative direction…" required />
            </label>
            <div className="booking-form__footer">
              <p>Secure form delivery is enabled when the booking endpoint is connected.</p>
              <MagneticButton className="submit-button" type="submit" disabled={bookingState === "submitting"} reduced={reduced}>
                {bookingState === "submitting" ? "Sending…" : "Send enquiry"} <Arrow />
              </MagneticButton>
            </div>
            <p className="booking-status" aria-live="polite">{bookingStatus}</p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top" aria-label="Go to top">PP<span>®</span></a>
        <p>© {new Date().getFullYear()} Phương Phương</p>
        <a href="#top">Back to top ↑</a>
      </footer>

      <Lightbox lightbox={lightbox} onClose={closeLightbox} setLightbox={setLightbox} />
    </div>
  );
}

export default App;
