
import { useNavigate } from "react-router";

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Ratio from 'react-bootstrap/Ratio';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';


export default function MovieDetails() {

  
  return ( 
  <Container>
    <Row className="justify-content-md-center">
      <Col>
        <Trailer/>
        <FilmInfo/>
      </Col>
      <Col>
        <ThisDate/>
        <SlotSelection />
      </Col>
    </Row>
  </Container>
  );
}

function Trailer() {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Trailer</Card.Title>
        <Ratio aspectRatio="16x9">
            <iframe
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="Movie trailer"
              allowFullScreen
            />
          </Ratio>
        <Card.Text>
          information om film finns här
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

function FilmInfo () {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Film info</Card.Title>
        <Card.Text>
          information om film finns här
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

function ThisDate() {
  return (
    <Card>
      <Card.Body className="text-center">
        <Card.Title> 02-10-2026 </Card.Title>
      </Card.Body>
    </Card>
  );
}

function SlotSelection() {
  const navigate = useNavigate();
  return (
    <div className="d-grid gap-4 w-50 mx-auto">
      <Button variant="primary" size="lg" onClick={() => navigate(`/booking`)}>
        salong 1 tid 16:00
      </Button>
      <Button variant="primary" size="lg" onClick={() => navigate(`/booking`)}>
        salong 2 tid 16:00
      </Button>
      <Button variant="primary" size="lg" onClick={() => navigate(`/booking`)}>
        salong 1 tid 20:00
      </Button>
      <Button variant="primary" size="lg" onClick={() => navigate(`/booking`)}>
        salong 2 tid 20:00
      </Button>
    </div>
  );
  
}

MovieDetails.route = {
  path: "/moviedetails/moviecatalog/:id",
  order: 1,
  label: "Film detaljer",
};
