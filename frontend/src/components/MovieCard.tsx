import React from "react";
import { Link } from "react-router";
import Card from "react-bootstrap/Card";
import AgeBadge from "./AgeBadge";
import noPoster from "../assets/img/no-poster.webp";

export interface MovieCardProps {
  movieId: number | string;
  title: string;
  images: string[] | string;
  ageRating?: number | null;
  showDetails?: boolean;
  datum?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movieId,
  title,
  images,
  ageRating,
  showDetails = true,
  datum,
}) => {
  let imageUrl = "";
  try {
    const parsedImages =
      typeof images === "string" ? JSON.parse(images) : images;
    imageUrl = Array.isArray(parsedImages) ? parsedImages[0] : parsedImages;
  } catch {
    imageUrl = typeof images === "string" ? images : "";
  }

  // Bygg sökvägen, med valt datum om det finns
  const targetPath = datum
    ? `/movies/${movieId}?datum=${datum}`
    : `/movies/${movieId}`;

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
        <Card.Img variant="top" src={imageUrl || noPoster} alt={title} />

        {/* Åldersmärkning uppe i högra hörnet (#484) */}
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
