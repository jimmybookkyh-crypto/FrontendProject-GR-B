import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MovieCard from './MovieCard';

export interface Movie {
  movieId: number | string;
  title: string;
  images?: string[] | string;
  ageRating?: number;
  [key: string]: any;
}

interface MovieGridProps {
  movies: Movie[];
  datum?: string;
  showDetails?: boolean; // <-- Lägg till denna i interface
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, datum, showDetails = true }) => {
  return (
    <Row xs={2} md={3} lg={4} className="g-4">
      {movies.map((movie) => (
        <Col key={movie.movieId}>
          <MovieCard
            movieId={movie.movieId}
            title={movie.title}
            images={movie.images ?? ''}
            ageRating={movie.ageRating}
            datum={datum}
            showDetails={showDetails} // <-- Skicka vidare till MovieCard
          />
        </Col>
      ))}
    </Row>
  );
};

export default MovieGrid;