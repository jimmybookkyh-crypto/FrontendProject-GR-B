import Card from "react-bootstrap/Card";
import Ratio from "react-bootstrap/Ratio";

type TrailerProps = {
  youtubeId?: string | null; // från movies.youtubetrailers[0], t.ex. "Go8nTmfrQd8"
  title: string; // filmens titel, läses upp av skärmläsare
};

/* #339: Gemensam trailerspelare.
   Användning: <Trailer youtubeId={film.youtubetrailers?.[0]} title={film.title} />
   Saknas trailer visas ingenting. */
export default function Trailer({ youtubeId, title }: TrailerProps) {
  if (!youtubeId) return null;

  return (
    <Card className="mb-4 glass-card">
      <Card.Body className="p-3">
        <Card.Title as="h3" className="mb-3 fs-4 d-flex justify-content-center">
          Trailer
        </Card.Title>
        <Ratio aspectRatio="16x9">
          <iframe
            // youtube-nocookie.com sätter inga spårningscookies förrän man trycker play
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={`Trailer: ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
            className="rounded"
          />
        </Ratio>
      </Card.Body>
    </Card>
  );
}
