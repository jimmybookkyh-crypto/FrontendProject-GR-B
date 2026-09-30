import { useNavigate } from "react-router";
import { Container,Col,Row,Ratio,Card,Button,Badge, } from 'react-bootstrap';
import backgroundImage from "../assets/img/biodukbg.png";


export default function MovieDetails() {

   
  return ( 
    <div
      className="min-vh-100 w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Container className="py-5">
        <Row className="g-4 justify-content-center">
          <Col lg={7} md={12}>
            <Trailer />
            <FilmInfo />
          </Col>
          <Col lg={5} md={12}>
            <ThisDate />
            <SlotSelection />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function Trailer() {
  return (
    <Card className="mb-4 shadow-lg border-0 bg-dark text-white bg-opacity-75">
      <Card.Body className="p-3">
        <Card.Title as="h3" className="mb-3 fs-4">Trailer</Card.Title>
        <Ratio aspectRatio="16x9">
          <iframe
            src="https://www.youtube.com/embed/Go8nTmfrQd8"
            title="Movie trailer"
            allowFullScreen
            className="rounded"
          />
        </Ratio>
      </Card.Body>
    </Card>
  );
}

function FilmInfo() {
  return (
    <Card className="mb-0 shadow-lg border-0 bg-dark text-white bg-opacity-75">
      <Card.Body className="p-4">

        {/* Badges */}
            <Card.Title as="h2" className="mb-1">Thor: Love and Thunder</Card.Title>
            <Card.Subtitle className="text-white-50 fs-6 mb-2">
              Originaltitel: Thor: Love and Thunder (2022)
            </Card.Subtitle>
          
        <div className="d-flex gap-2 mb-2">
            <Badge bg="danger" className="p-2">11 år</Badge>
            <Badge bg="secondary" className="p-2">1 tim 59 min</Badge>
        </div>
        
        {/* Genrer */}
        <div className="mb-3">
          <Badge bg="outline-light" className="border text-white me-1">Action</Badge>
          <Badge bg="outline-light" className="border text-white me-1">Äventyr</Badge>
          <Badge bg="outline-light" className="border text-white">Komedi</Badge>
        </div>

        <hr className="border-secondary my-3" />

        <p className="fs-6 lh-base mb-4">
          Thor ger sig ut på en resa olik något han någonsin ställts inför, en jakt på inre frid. 
          Men hans pensionering avbryts av en galaktisk mördare känd som Gorr the God Butcher, 
          som vill utrota alla gudar. För att bekämpa hotet tar Thor hjälp av King Valkyrie, 
          Korg och sin före detta flickvän Jane Foster.
        </p>

        <hr className="border-secondary my-3" />

        {/* Filminformation */}
        <div className="small text-white-50 mt-1">
          <div className="mb-1">
            <strong className="text-white">Regissör:</strong> Taika Waititi
          </div>
          <div className="mb-1">
            <strong className="text-white">Manusförfattare:</strong> Taika Waititi, Jennifer Kaytin Robinson
          </div>
          <div>
            <strong className="text-white">Skådespelare:</strong> Chris Hemsworth, Natalie Portman, Christian Bale, Tessa Thompson, Russell Crowe
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
function ThisDate() {
  return (
    <Card className="mb-4 shadow-lg border-0 bg-dark text-white bg-opacity-75 text-center">
      <Card.Body className="py-3">
        <Card.Subtitle className="text-white-50 small text-uppercase mb-1">
          Valt datum
        </Card.Subtitle>
        <Card.Title as="h3" className="mb-0 fw-bold fs-4">
          Fredag 02-10-2026
        </Card.Title>
      </Card.Body>
    </Card>
  );
}

function SlotSelection() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-lg border-0 bg-dark text-white bg-opacity-75">
      <Card.Body className="p-4">
        <Card.Title as="h3" className="mb-4 text-center fs-5 text-white-50">
          Välj visningstid
        </Card.Title>

        <div className="d-grid gap-3 w-75 mx-auto">
          <Button
            variant="outline-light" //skiftar färg
            size="lg"
            className="rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
            onClick={() => navigate('/booking')}
             style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
          >
            <span>Salong 1</span>
            <span>kl 16:00</span>
          </Button>

          <Button
            variant="outline-light"
            size="lg"
            className="rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
             style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
          >
            <span>Salong 2</span>
            <span>kl 16:00</span>
          </Button>

          <Button
            variant="outline-light"
            size="lg"
            className="rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
             style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
          >
            <span>Salong 1</span>
            <span>kl 20:00</span>
          </Button>

          <Button
            variant="outline-light"
            size="lg"
            className="rounded-pill py-2 px-4 fw-bold d-flex justify-content-between align-items-center"
             style={{ backgroundColor: '#8e1733', borderColor: '#8e1733' }}
          >
            <span>Salong 2</span>
            <span>kl 20:00</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

MovieDetails.route = {
  path: "/moviedetails/moviecatalog/:id",
  order: 1,
  label: "Film detaljer",
};