import React from "react";
import { Link } from "react-router";
import Card from "react-bootstrap/Card";
import AgeBadge from "./AgeBadge";
import noPoster from "../assets/img/no-poster.webp";
import { paths } from "../utils/paths.ts";
import { moviePoster } from "../utils/images.ts";

export interface MovieCardProps {
  movieId: number | string;
  title: string;
  images: string[] | string;
  ageRating?: number | null;
  showDetails?: boolean;
  datum?: string;
  navigatedFrom?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movieId,
  title,
  images,
  ageRating,
  showDetails = true,
  datum,
  navigatedFrom,
}) => {
  const poster = moviePoster(
    images,
    "(min-width: 992px) 25vw, (min-width: 768px) 33vw, 50vw",
  );

  // Bygg sökvägen, med valt datum och från beskrvining om det finns
  const targetPath = `${paths.movie(movieId)}${
    datum || navigatedFrom
      ? `?${datum ? `datum=${datum}` : ""}${
          datum && navigatedFrom ? "&" : ""
        }${navigatedFrom ? `fran=${navigatedFrom}` : ""}`
      : ""
  }`;

  return (
    <Card
      className="movie-card h-100 position-relative bg-dark bg-opacity-75 text-white border border-secondary rounded-3 overflow-hidden"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <Link
        to={targetPath}
        className="position-relative d-block text-decoration-none"
      >
        <Card.Img
          variant="top"
          src={poster.src || noPoster}
          srcSet={poster.srcSet}
          sizes={poster.sizes}
          alt={title}
          loading="lazy"
        />

        <AgeBadge
          ageRating={ageRating}
          className="position-absolute top-0 end-0 m-2 z-2"
        />
      </Link>

      {showDetails && (
        <Card.Body className="d-flex flex-column justify-content-between text-white bg-dark bg-opacity-75">
          <Card.Title className="text-white fw-bold mb-3">{title}</Card.Title>
          <Link
            to={targetPath}
            className="cta-btn mt-2 d-flex align-items-center justify-content-center text-center text-decoration-none"
          >
            Biljetter →
          </Link>
        </Card.Body>
      )}
    </Card>
  );
};

export default MovieCard;
