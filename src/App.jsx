import React, { useEffect, useRef, useState } from "react";
import {
  aboutImage,
  content,
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
  [content.site.navigation.work || "Work", "#work", "work"],
  [content.site.navigation.editorial || "Editorial", "#editorial", "editorial"],
  [content.site.navigation.about || "About", "#about", "about"],
  [content.site.navigation.contact || "Book", "#contact", "contact"]
];
const sectionIds = navItems.map(([, , id]) => id);
const galleryParallax = [-18, 14, -12, 18, -16, 12, -14, 16];

function Header({ menuOpen, setMenuOpen, reduced, initials }) {
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
        {initials}<span>®</span>
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
  const renderLine = (line) => {
    if (React.isValidElement(line)) return line;
    if (typeof line === "object" && line?.italic) return <em>{line.text}</em>;
    return typeof line === "object" ? line.text : line;
  };

  return (
    <h2 className={"line-reveal " + className} data-reveal="lines">
      {lines.map((line, index) => (
        <span className="line-reveal__mask" key={index}>
          <span
            className="line-reveal__content"
            style={{ "--line-delay": index * 110 + "ms" }}
          >
            {renderLine(line)}
          </span>
        </span>
      ))}
    </h2>
  );
}

function HeroTitle({ words, name }) {
  return (
    <h1 className="hero__heading" aria-label={name} data-reveal="hero">
      {words.map((word, wordIndex) => (
        <span
          className={
            wordIndex === 1
              ? "hero__word hero__heading--offset"
              : "hero__word hero__word--primary"
          }
          key={word + wordIndex}
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
  const hasWebp = Boolean(asset.webpSrcSet);
  const hasJpegSrcSet = Boolean(asset.jpegSrcSet);

  return (
    <picture>
      {hasWebp && <source type="image/webp" srcSet={asset.webpSrcSet} sizes={sizes} />}
      <img
        className={className}
        src={asset.src}
        srcSet={hasJpegSrcSet ? asset.jpegSrcSet : undefined}
        sizes={sizes}
        width={asset.width || undefined}
        height={asset.height || undefined}
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

function PressMarquee({ label, items }) {
  return (
    <div className="press-marquee" data-reveal="marquee">
      <p>{label}</p>
      <div className="press-marquee__lane">
        <div className="press-marquee__track">
          {items.map((item) => (
            <a href={item.url} target="_blank" rel="noreferrer" key={item.label}>
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
  const { site, hero, statement, selectedWork, editorial, reel, about, contact } = content;
  const reelInterval = Math.min(Math.max(Number(reel.intervalMs) || 3600, 1200), 12000);
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
    const toAbsoluteUrl = (value) => {
      try {
        return new URL(value, site.seo.canonicalUrl || window.location.origin).toString();
      } catch {
        return value;
      }
    };
    const updateMeta = (selector, value) => {
      if (!value) return;
      const element = document.head.querySelector(selector);
      if (element) element.setAttribute("content", value);
    };

    document.title = site.seo.title || site.name;
    updateMeta('meta[name="description"]', site.seo.description);
    updateMeta('meta[property="og:title"]', site.seo.title);
    updateMeta('meta[property="og:description"]', site.seo.description);
    updateMeta('meta[property="og:image"]', toAbsoluteUrl(site.seo.shareImage));
    updateMeta('meta[property="og:url"]', site.seo.canonicalUrl);

    if (site.seo.canonicalUrl) {
      let canonical = document.head.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", site.seo.canonicalUrl);
    }
  }, [site]);

  useEffect(() => {
    const syncPageVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", syncPageVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncPageVisibility);
    };
  }, []);

  useEffect(() => {
    if (reduced || !reelActive || !pageVisible || lightbox || reelFrames.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setReelIndex((current) => (current + 1) % reelFrames.length);
    }, reelInterval);

    return () => window.clearInterval(timer);
  }, [lightbox, pageVisible, reduced, reelActive, reelFrames.length, reelInterval]);

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
      setBookingStatus(contact.form.mailClientMessage);
      return;
    }

    setBookingState("submitting");
    setBookingStatus(contact.form.sendingMessage);

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
      setBookingStatus(contact.form.successMessage);
    } catch {
      setBookingState("error");
      setBookingStatus(contact.form.errorMessage);
    }
  };

  return (
    <div className={menuOpen ? "app menu-is-open" : "app"}>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        reduced={reduced}
        initials={site.initials}
      />

      <main>
        <section className="hero" id="top" ref={heroRef}>
          <div className="hero__meta">
            <p>{site.location}</p>
            <p>{site.role}</p>
          </div>
          <div className="hero__content">
            <HeroTitle words={hero.nameLines} name={site.name} />
            <div className="hero__image-wrap">
              <div className="hero__image">
                <ResponsiveImage
                  asset={heroImage}
                  alt={hero.imageAlt}
                  sizes="(max-width: 760px) 61vw, 31vw"
                  priority
                />
              </div>
              <p className="hero__image-caption">{hero.imageCaption}</p>
            </div>
            <p className="hero__intro">
              {hero.intro}
            </p>
          </div>
          <div className="hero__footer">
            <MagneticLink href={hero.ctaTarget} className="text-link" reduced={reduced}>
              {hero.ctaLabel} <Arrow />
            </MagneticLink>
            <p>{hero.yearLabel}</p>
          </div>
        </section>

        <section className="statement section-shell">
          <p className="eyebrow" data-reveal="eyebrow">{statement.eyebrow}</p>
          <div className="statement__copy" data-reveal="copy">
            <p>{statement.prefix}<em>{statement.emphasis}</em>{statement.suffix}</p>
          </div>
        </section>

        <section className="works section-shell" id="work">
          <div className="section-heading">
            <div>
              <p className="eyebrow" data-reveal="eyebrow">{selectedWork.eyebrow}</p>
              <LinesReveal lines={selectedWork.headingLines} />
            </div>
            <p className="section-heading__aside" data-reveal="eyebrow">{selectedWork.helperText}</p>
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
          <a className="outline-link" href={selectedWork.ctaTarget}>{selectedWork.ctaLabel} <Arrow /></a>
        </section>

        <section className="editorial" id="editorial">
          <div className="section-shell editorial__heading">
            <p className="eyebrow" data-reveal="eyebrow">{editorial.eyebrow}</p>
            <LinesReveal lines={editorial.headingLines} />
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
              <p>{reel.overlayTitle}</p>
              <span>{reel.overlayDuration}</span>
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
            <p className="eyebrow">{reel.eyebrow}</p>
            <p>{reel.caption}</p>
          </div>
        </section>

        <section className="about" id="about">
          <div className="about__image motion-image-block" data-reveal="image">
            <ResponsiveImage
              asset={aboutImage}
              alt={about.imageAlt}
              sizes="(max-width: 760px) 100vw, 50vw"
            />
          </div>
          <div className="about__content section-shell">
            <p className="eyebrow" data-reveal="eyebrow">{about.eyebrow}</p>
            <LinesReveal lines={about.headingLines} />
            <div className="about__columns" data-reveal="copy">
              <div>
                <p>{about.biography}</p>
                <MagneticLink className="text-link" href={"mailto:" + profile.email} reduced={reduced}>
                  {about.ctaLabel} <Arrow />
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
            <PressMarquee label={about.pressLabel} items={about.press} />
          </div>
        </section>

        <section className="contact section-shell" id="contact">
          <div className="contact__intro">
            <p className="eyebrow" data-reveal="eyebrow">{contact.eyebrow}</p>
            <LinesReveal lines={contact.headingLines} />
            <div className="contact__direct">
              <a href={"mailto:" + profile.email}>{profile.email}</a>
              {profile.socialLinks.map((link) => (
                <a href={link.url} target="_blank" rel="noreferrer" key={link.label}>
                  {link.label} <Arrow />
                </a>
              ))}
            </div>
            <a className="comp-card-link" href={contact.compCard.url} download>
              {contact.compCard.label} <Arrow />
            </a>
          </div>
          <form className="booking-form" onSubmit={submitBooking} data-reveal="copy">
            <label>
              <span>{contact.form.nameLabel}</span>
              <input type="text" name="name" autoComplete="name" placeholder={contact.form.namePlaceholder} required />
            </label>
            <label>
              <span>{contact.form.emailLabel}</span>
              <input type="email" name="email" autoComplete="email" placeholder={contact.form.emailPlaceholder} required />
            </label>
            <label>
              <span>{contact.form.projectLabel}</span>
              <select name="project" defaultValue="" required>
                <option value="" disabled>{contact.form.projectPlaceholder}</option>
                {contact.form.projectOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{contact.form.messageLabel}</span>
              <textarea name="message" rows="4" placeholder={contact.form.messagePlaceholder} required />
            </label>
            <div className="booking-form__footer">
              <p>{contact.form.helperText}</p>
              <MagneticButton className="submit-button" type="submit" disabled={bookingState === "submitting"} reduced={reduced}>
                {bookingState === "submitting" ? contact.form.submittingLabel : contact.form.submitLabel} <Arrow />
              </MagneticButton>
            </div>
            <p className="booking-status" aria-live="polite">{bookingStatus}</p>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#top" aria-label="Go to top">{site.initials}<span>®</span></a>
        <p>© {new Date().getFullYear()} {site.footer.copyrightName}</p>
        <a href="#top">{site.footer.backToTopLabel}</a>
      </footer>

      <Lightbox lightbox={lightbox} onClose={closeLightbox} setLightbox={setLightbox} />
    </div>
  );
}

export default App;
