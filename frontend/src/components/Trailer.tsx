import Card from "react-bootstrap/Card";
import Ratio from "react-bootstrap/Ratio";

type TrailerProps = {
  youtubeId?: string | null;
  title: string;
};


export default function Trailer({ youtubeId, title }: TrailerProps) {
  if (!youtubeId) return null;

  return (
    <Card className="mb-4 glass-card">
      <Card.Body className="p-3">
        <Card.Title as="h3" className="mb-3 fs-4 d-flex justify-content-center">
          Trailer
        </Card.Title>
        <div className="trailer-container rounded">
          <Ratio aspectRatio="16x9">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title={`Trailer: ${title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
              className="rounded"
            />
          </Ratio>
        </div>
      </Card.Body>
    </Card>
  );
}
