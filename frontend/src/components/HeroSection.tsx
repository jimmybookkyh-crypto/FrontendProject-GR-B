import { useCallback, useEffect, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import TicketButton from "./ticketButton";
import AgeBadge from "./AgeBadge";
import {
  CONSENT_CHANGED_EVENT,
  hasStatisticsConsent,
} from "../utils/cookieConsent";
import "../styles/HeroSection.css";

const MAX_MOVIE_SLIDES = 3;
const SLIDE_INTERVAL_MS = 7000;
const HERO_TRAILER_CLIPS: Record<
  number,
  { id?: string; start?: number; end?: number }
> = {
  // Exempel: 31: { id: "KLISTRA-IN-ID", start: 30, end: 48 },
};

const HERO_SKIP_MOVIE_IDS = new Set<string>(["40"]);

const DEFAULT_TRAILER_START = 7;
const DEFAULT_TRAILER_END = 25;
const POSTER_DELAY_MS = 2500;
const PLAYING_SETTLE_MS = 3700;
const END_FADE_SECONDS = 1;
const TRAILER_FALLBACK_MS = 12000;

type HeroEvent = {
  eventId: string;
  name: string;
  info: string | null;
  tagline: string | null;
  periods: { startDate: string; endDate: string }[];
};

type HeroEventShowing = {
  showingId: string;
  date: string;
  time: string;
  movieId: string;
  movieTitle: string;
};

type HeroMovie = {
  movieId: number | string;
  title: string;
  productionyear?: number | null;
  ageRating?: number | null;
  description?: string | null;
  images?: string[] | string;
  youtubetrailers?: string[] | string;
};

type HeroSlideData = {
  key: string;
  label: string;
  title: string;
  ageRating?: number | null;
  text: string;
  poster: string;
  trailerId: string;
  trailerStart: number;
  trailerEnd: number;
  buttonTo: string;
  buttonLabel: string;
};

function getFirstValue(value?: string[] | string): string {
  if (!value) return "";
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? (parsed[0] ?? "") : String(parsed);
  } catch {
    return typeof value === "string" ? value : "";
  }
}

function getFirstSentence(text?: string | null): string {
  if (!text) return "";
  const firstParagraph = text.split(/\n+/)[0].trim();
  const match = firstParagraph.match(/^.*?[.!?](\s|$)/);
  return (match ? match[0] : firstParagraph).trim();
}

function getFirstParagraph(text?: string | null): string {
  return text ? text.split(/\n+/)[0].trim() : "";
}

function getShowingKey(showing: { date: string; time: string }): string {
  return `${showing.date}T${showing.time.slice(0, 5)}`;
}

function getNowKey(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const shortDateFormat = new Intl.DateTimeFormat("sv-SE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatShortDate(date: string): string {
  return shortDateFormat
    .format(new Date(`${date}T00:00:00`))
    .replace(/\./g, "");
}

const dayMonthFormat = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "short",
});

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const clean = (value: string) => value.replace(/\./g, "");
  const endText = clean(dayMonthFormat.format(endDate));

  if (start === end) return endText;
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}–${endText}`;
  }
  return `${clean(dayMonthFormat.format(startDate))}–${endText}`;
}

function getMovieMedia(movie: HeroMovie | undefined) {
  const clip = movie ? HERO_TRAILER_CLIPS[Number(movie.movieId)] : undefined;
  return {
    poster: getFirstValue(movie?.images),
    trailerId: clip?.id ?? getFirstValue(movie?.youtubetrailers),
    trailerStart: clip?.start ?? DEFAULT_TRAILER_START,
    trailerEnd: clip?.end ?? DEFAULT_TRAILER_END,
  };
}

function buildEventSlides(
  event: HeroEvent,
  period: { startDate: string; endDate: string },
  periodShowings: HeroEventShowing[],
  upcoming: HeroEventShowing[],
  movieById: Map<string, HeroMovie>,
): HeroSlideData[] {
  const periodText = formatPeriod(period.startDate, period.endDate);
  const today = getNowKey().slice(0, 10);
  const hasStarted = period.startDate <= today;

  const byNewest = (a: string, b: string) =>
    (movieById.get(b)?.productionyear ?? 0) -
    (movieById.get(a)?.productionyear ?? 0);

  const eventMovieIds = [
    ...new Set(periodShowings.map((s) => String(s.movieId))),
  ]
    .filter((id) => !HERO_SKIP_MOVIE_IDS.has(id))
    .sort(byNewest);
  const eventMovieId = eventMovieIds[0];

  const eventSlide: HeroSlideData = {
    key: `event-${event.eventId}`,
    label: `${hasStarted ? "Månadens event" : "Kommande event"} · ${periodText}`,
    title: event.name,
    text: event.tagline ?? getFirstParagraph(event.info),
    ...getMovieMedia(movieById.get(eventMovieId)),
    buttonTo: `/event#event-${event.eventId}`,
    buttonLabel: "Läs om eventet →",
  };

  const upcomingMovieIds = [...new Set(upcoming.map((s) => String(s.movieId)))]
    .filter((id) => id !== eventMovieId && !HERO_SKIP_MOVIE_IDS.has(id))
    .sort(byNewest)
    .slice(0, MAX_MOVIE_SLIDES);

  const movieSlides = upcomingMovieIds.map((id): HeroSlideData => {
    const movie = movieById.get(id);
    const nextShowing = upcoming.find((s) => String(s.movieId) === id)!;
    return {
      key: `movie-${id}`,
      label: `${event.name} · ${periodText}`,
      title: movie?.title ?? nextShowing.movieTitle,
      ageRating: movie?.ageRating,
      text: getFirstSentence(movie?.description),
      ...getMovieMedia(movie),
      buttonTo: `/movies/${id}?datum=${nextShowing.date}`,
      buttonLabel: `Biljetter → ${formatShortDate(nextShowing.date)}`,
    };
  });

  return [eventSlide, ...movieSlides];
}

function buildFallbackSlides(movies: HeroMovie[]): HeroSlideData[] {
  return movies
    .filter(
      (movie) =>
        getFirstValue(movie.images) &&
        !HERO_SKIP_MOVIE_IDS.has(String(movie.movieId)),
    )
    .slice(0, MAX_MOVIE_SLIDES + 1)
    .map((movie) => ({
      key: `movie-${movie.movieId}`,
      label: "Visas nu",
      title: movie.title,
      ageRating: movie.ageRating,
      text: getFirstSentence(movie.description),
      ...getMovieMedia(movie),
      buttonTo: `/movies/${movie.movieId}`,
      buttonLabel: "Se filmen →",
    }));
}

function useHeroSlides(): HeroSlideData[] {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const getData = <T,>(path: string): Promise<T | null> =>
      fetch(`/api${path}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : { data: null }))
        .then((body: { data?: T | null }) => body.data ?? null)
        .catch(() => null);

    (async () => {
      const [events, movies, currentMovies] = await Promise.all([
        getData<HeroEvent[]>("/events?limit=100"),
        getData<HeroMovie[]>("/movies?limit=100"),
        getData<HeroMovie[]>("/movies/current"),
      ]);
      if (controller.signal.aborted) return;

      const movieById = new Map(
        (movies ?? []).map((movie) => [String(movie.movieId), movie]),
      );
      const nowKey = getNowKey();

      const candidates = await Promise.all(
        (events ?? [])
          .filter((event) => event.periods?.length > 0)
          .map(async (event) => {
            const period = event.periods[0];
            const showings =
              (await getData<HeroEventShowing[]>(
                `/events/${event.eventId}/showings`,
              )) ?? [];
            const periodShowings = showings.filter(
              (s) => s.date >= period.startDate && s.date <= period.endDate,
            );
            const upcoming = periodShowings.filter(
              (s) => getShowingKey(s) > nowKey,
            );
            return { event, period, periodShowings, upcoming };
          }),
      );
      if (controller.signal.aborted) return;

      const chosen = candidates
        .filter((candidate) => candidate.upcoming.length > 0)
        .sort((a, b) =>
          getShowingKey(a.upcoming[0]).localeCompare(
            getShowingKey(b.upcoming[0]),
          ),
        )[0];

      setSlides(
        chosen
          ? buildEventSlides(
              chosen.event,
              chosen.period,
              chosen.periodShowings,
              chosen.upcoming,
              movieById,
            )
          : buildFallbackSlides(currentMovies ?? []),
      );
    })();

    return () => controller.abort();
  }, []);

  return slides;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useTrailerAllowed(): boolean {
  const canPlay = () =>
    window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    ).matches && hasStatisticsConsent();
  const [allowed, setAllowed] = useState(canPlay);

  useEffect(() => {
    const update = () => setAllowed(canPlay());
    window.addEventListener(CONSENT_CHANGED_EVENT, update);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, update);
  }, []);

  return allowed;
}

export default function HeroSection() {
  const slides = useHeroSlides();
  const [isPaused, setIsPaused] = useState(prefersReducedMotion);
  const [activeIndex, setActiveIndex] = useState(0);
  const allowTrailer = useTrailerAllowed();
  const [soundOn, setSoundOn] = useState(false);
  const slideCount = slides.length;

  const goToNextSlide = useCallback(() => {
    setActiveIndex((index) => (slideCount > 0 ? (index + 1) % slideCount : 0));
  }, [slideCount]);

  if (slides.length === 0) {
    return (
      <div className="hero-carousel">
        <div className="hero-slide" aria-hidden="true" />
      </div>
    );
  }

  const currentIndex = activeIndex % slideCount;
  const activeHasTrailer =
    allowTrailer && Boolean(slides[currentIndex].trailerId);

  return (
    <div className="hero-wrapper">
      <Carousel
        className="hero-carousel"
        activeIndex={currentIndex}
        onSelect={(index) => setActiveIndex(index)}
        interval={isPaused || activeHasTrailer ? null : SLIDE_INTERVAL_MS}
        prevLabel="Föregående"
        nextLabel="Nästa"
        indicatorLabels={slides.map((slide) => `Visa ${slide.title}`)}
      >
        {slides.map((slide, index) => {
          const isFirst = index === 0;
          const isActive = index === currentIndex;
          const Heading = isFirst ? "h1" : "h2";

          return (
            <Carousel.Item key={slide.key}>
              <div className="hero-slide">
                <HeroMedia
                  key={isActive ? "active" : "inactive"}
                  title={slide.title}
                  poster={slide.poster}
                  isFirst={isFirst}
                  trailerId={isActive && allowTrailer ? slide.trailerId : ""}
                  start={slide.trailerStart}
                  end={slide.trailerEnd}
                  muted={!soundOn}
                  paused={isPaused}
                  onTrailerEnd={goToNextSlide}
                />

                <div className="hero-slide-content">
                  <p className="hero-slide-label">{slide.label}</p>
                  <div className="hero-slide-title-row">
                    <Heading className="hero-slide-title">
                      {slide.title}
                    </Heading>
                    <AgeBadge
                      ageRating={slide.ageRating}
                      className="hero-slide-age"
                    />
                  </div>
                  {slide.text && (
                    <p className="hero-slide-text">{slide.text}</p>
                  )}

                  <div className="hero-slide-ticket">
                    <TicketButton
                      to={slide.buttonTo}
                      label={slide.buttonLabel}
                    />
                  </div>
                </div>
              </div>
            </Carousel.Item>
          );
        })}
      </Carousel>

      {activeHasTrailer && (
        <button
          type="button"
          className="hero-sound-toggle"
          onClick={() => setSoundOn((on) => !on)}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Stäng av ljudet" : "Slå på ljudet"}
          title={soundOn ? "Stäng av ljudet" : "Slå på ljudet"}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 5 6 9H2v6h4l5 4V5z" />
            {soundOn ? (
              <>
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </>
            ) : (
              <>
                <path d="m22 9-6 6" />
                <path d="m16 9 6 6" />
              </>
            )}
          </svg>
        </button>
      )}

      {slides.length > 1 && (
        <button
          type="button"
          className="hero-pause-toggle"
          onClick={() => setIsPaused((paused) => !paused)}
          aria-label={isPaused ? "Starta bildspelet" : "Pausa bildspelet"}
          title={isPaused ? "Starta bildspelet" : "Pausa bildspelet"}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="currentColor"
            aria-hidden="true"
          >
            {isPaused ? (
              <path d="M8 5v14l11-7z" />
            ) : (
              <>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </>
            )}
          </svg>
        </button>
      )}
    </div>
  );
}

type HeroMediaProps = {
  title: string;
  poster: string;
  isFirst: boolean;
  trailerId: string;
  start: number;
  end: number;
  muted: boolean;
  paused: boolean;
  onTrailerEnd: () => void;
};

const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const VIDEO_WIDTH = 1920;
const VIDEO_HEIGHT = 1080;
const VIDEO_CROP = 1.15;

function HeroMedia({
  title,
  poster,
  isFirst,
  trailerId,
  start,
  end,
  muted,
  paused,
  onTrailerEnd,
}: HeroMediaProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [videoScale, setVideoScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoBoxRef = useRef<HTMLDivElement>(null);
  const onTrailerEndRef = useRef(onTrailerEnd);
  const mutedRef = useRef(muted);
  const pausedRef = useRef(paused);

  useEffect(() => {
    onTrailerEndRef.current = onTrailerEnd;
  }, [onTrailerEnd]);

  const sendCommand = (func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args,
        id: 1,
        channel: "widget",
      }),
      "*",
    );
  };

  useEffect(() => {
    mutedRef.current = muted;
    if (!trailerId) return;
    if (muted) {
      sendCommand("mute");
    } else {
      sendCommand("unMute");
      sendCommand("setVolume", [80]);
    }
  }, [muted, trailerId]);

  useEffect(() => {
    pausedRef.current = paused;
    if (!trailerId) return;
    if (paused) {
      sendCommand("pauseVideo");
    } else {
      sendCommand("playVideo");
    }
  }, [paused, trailerId]);

  useEffect(() => {
    const box = videoBoxRef.current;
    if (!box) return;

    const updateScale = () => {
      const { width, height } = box.getBoundingClientRect();
      const coverScale = Math.max(width / VIDEO_WIDTH, height / VIDEO_HEIGHT);
      setVideoScale(coverScale * VIDEO_CROP);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(box);
    return () => observer.disconnect();
  }, [trailerId]);

  useEffect(() => {
    if (!trailerId) return;

    let isReady = false;
    let isPlaying = false;
    let posterDone = false;
    let playingSettled = false;
    let isFinished = false;
    let settleTimer: number | undefined;
    let endTimer: number | undefined;

    const revealIfReady = () => {
      if (posterDone && playingSettled && !pausedRef.current) {
        setShowTrailer(true);
      }
    };

    const finish = () => {
      if (isFinished) return;
      isFinished = true;
      setIsEnding(true);
      endTimer = window.setTimeout(() => onTrailerEndRef.current(), 400);
    };

    const posterTimer = window.setTimeout(() => {
      posterDone = true;
      revealIfReady();
    }, POSTER_DELAY_MS);

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      let data: { event?: string; info?: unknown };
      try {
        data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (!isReady) {
        isReady = true;
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: "addEventListener",
            args: ["onStateChange"],
            id: 1,
            channel: "widget",
          }),
          "*",
        );
      }

      const info =
        data.event === "infoDelivery"
          ? (data.info as
              | { playerState?: number; currentTime?: number }
              | undefined)
          : undefined;

      const state =
        data.event === "onStateChange"
          ? (data.info as number)
          : info?.playerState;

      if (state === YT_PLAYING && !isPlaying) {
        isPlaying = true;
        if (pausedRef.current) {
          sendCommand("pauseVideo");
          return;
        }
        if (!mutedRef.current) {
          sendCommand("unMute");
          sendCommand("setVolume", [80]);
        }
        settleTimer = window.setTimeout(() => {
          playingSettled = true;
          revealIfReady();
        }, PLAYING_SETTLE_MS);
      }

      if (state === YT_PAUSED) {
        isPlaying = false;
        playingSettled = false;
        window.clearTimeout(settleTimer);
        setShowTrailer(false);
      }

      if (
        isPlaying &&
        typeof info?.currentTime === "number" &&
        info.currentTime >= end - END_FADE_SECONDS
      ) {
        finish();
      }

      if (state === YT_ENDED && isPlaying) {
        finish();
      }
    };

    window.addEventListener("message", handleMessage);

    const fallbackTimer = window.setTimeout(() => {
      if (!isPlaying && !pausedRef.current) finish();
    }, TRAILER_FALLBACK_MS);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(posterTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(endTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [trailerId, end]);

  const handleTrailerLoad = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*",
    );
  };

  const params = new URLSearchParams({
    enablejsapi: "1",
    origin: window.location.origin,
    autoplay: "1",
    mute: "1",
    controls: "0",
    start: String(start),
    end: String(end),
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    iv_load_policy: "3",
  });

  const trailerVisible = showTrailer && !paused;
  const hiddenClass = trailerVisible ? " is-hidden" : "";
  const videoClass = `hero-slide-video${trailerVisible ? " is-visible" : ""}${isEnding ? " is-ending" : ""}`;

  return (
    <>
      {poster && (
        <div
          className={`hero-slide-bg${hiddenClass}`}
          style={{ backgroundImage: `url(${poster})` }}
          aria-hidden="true"
        />
      )}

      {trailerId && (
        <div ref={videoBoxRef} className={videoClass} aria-hidden="true">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${trailerId}?${params}`}
            title={`Trailer: ${title}`}
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            onLoad={handleTrailerLoad}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            style={{ transform: `translate(-50%, -42%) scale(${videoScale})` }}
          />
        </div>
      )}

      {poster && (
        <img
          className={`hero-slide-poster${hiddenClass}`}
          src={poster}
          alt={`Affisch: ${title}`}
          fetchPriority={isFirst ? "high" : "auto"}
          loading={isFirst ? "eager" : "lazy"}
        />
      )}
    </>
  );
}
