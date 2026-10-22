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
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, datum }) => {
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
          />
        </Col>
      ))}
    </Row>
  );
};

export default MovieGrid;