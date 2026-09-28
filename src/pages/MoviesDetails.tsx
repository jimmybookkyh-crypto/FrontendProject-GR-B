
import { useNavigate } from "react-router";

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Ratio from 'react-bootstrap/Ratio';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import backgroundImage from "../assets/img/biodukbg.png";


export default function MovieDetails() {

  
  return ( 
  <Container style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
  }}>
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
              src="https://www.youtube.com/embed/Go8nTmfrQd8"
              title="Movie trailer"
              allowFullScreen
            />
          </Ratio>
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
          <p>Direktör: Taika Waititi</p>
          <p>Manus författare: Taika Waititi, Jennifer Kaytin Robinson, Stan Lee</p>
          <p>Skådespelare: Chris Hemsworth, Natilie Portman, Christian Bale</p>

          <p>Thor tar hjälp av Valkyrie, Korg och sitt ex Jane Foster för att bekämpa Gorr the God Butcher, som har för avsikt att utrota gudarna.</p>
        </Card.Text>
      </Card.Body>S
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
      <Button variant="primary" size="lg">
        salong 2 tid 16:00
      </Button>
      <Button variant="primary" size="lg">
        salong 1 tid 20:00
      </Button>
      <Button variant="primary" size="lg">
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
