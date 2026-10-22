import React from 'react';
import { Link } from 'react-router';
import Card from 'react-bootstrap/Card';

export interface MovieCardProps {
  movieId: number | string;
  title: string;
  images: string[] | string;
  ageRating?: number;
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
  let imageUrl = '';
  try {
    const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
    imageUrl = Array.isArray(parsedImages) ? parsedImages[0] : parsedImages;
  } catch {
    imageUrl = typeof images === 'string' ? images : '';
  }

  // Bygg sökvägen inklusive datum-parametern
  const targetPath = datum
    ? `/moviedetails/moviecatalog/${movieId}?datum=${datum}`
    : `/movies/${movieId}`;

  return (
    <Card
      className="movie-card h-100 position-relative bg-dark bg-opacity-75 text-white border border-secondary rounded-3 overflow-hidden"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <Link to={targetPath} className="position-relative d-block text-decoration-none">
        <Card.Img
          variant="top"
          src={imageUrl || 'https://via.placeholder.com/300x450?text=Ingen+bild'}
          alt={title}
        />

        {ageRating !== undefined && ageRating !== null && (
          <div
            className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center fw-bold text-white bg-dark bg-opacity-75 rounded-circle border border-light"
            style={{
              width: '36px',
              height: '36px',
              fontSize: '0.85rem',
              zIndex: 2,
            }}
          >
            {ageRating}+
          </div>
        )}
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