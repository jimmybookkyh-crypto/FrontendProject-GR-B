import "../styles/Start.css";
import { Link } from "react-router";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Carousel from 'react-bootstrap/Carousel'; 
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import TMNT from "../images/TMNT.jpg";
import Spiderman from "../images/Spiderman.jpeg";
import Superman from "../images/Superman.jpg";
import Mulanfilm from "../images/Mulanfilm.jpeg";
import Spidermanfilm from "../images/Spidelmanfilm.jpg";
import Ninja from "../images/Ninja.jpg";
import charlie from "../images/charlie.jpg";
import Thor from "../images/Thor.jpg";
import Batman from "../images/Batman.jpg";

export default function Start() {
  return (
    <>
      <NavBar />
      <HeroCarousel />
      <SizesExample />
      <Container>
        <FilmerStart />
      </Container>
      <Footer />
    </>
  );
}




/*Placeholder NAVBAR*/
function NavBar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">FYLLNADS NAVBAR</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">test</Nav.Link>
            <Nav.Link href="#link">test</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">test</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Mer test
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">test</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                test
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

/* Hero-section med slides */

function HeroCarousel() {
  return (
    <Carousel>
      <Carousel.Item>
        <img
        className="d-block w-100 hero-image"
        src={Ninja}
        alt="Första bilden"
        />
        <Carousel.Caption>
          <h3>Teen Age Mutant Ninja Turtles</h3>
                  </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
        className="d-block w-100 hero-image"
        src={Spiderman}
        alt="Andra bilden"
        />
        <Carousel.Caption>
          <h3>Spiderman</h3>
                  </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
       <img
        className="d-block w-100 hero-image"
        src={Superman}
        alt="Tredje bilden"
        />
        <Carousel.Caption>
          <h3>Superman</h3>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
} 

/* 3 filter knappar placeholder ( Görs sedan som komponenter ) */

function SizesExample() {
  return (
    <Container className="mt-4 mb-4">
      <Row className="g-5">
        <Col>
          <Button variant="danger" size="lg" className="w-100">Idag</Button>
        </Col>

        <Col>
          <Button variant="danger" size="lg" className="w-100">Imorgon</Button>
        </Col>

        <Col>
          <Button variant="danger" size="lg" className="w-100">Kalender</Button>
        </Col>
      </Row>
    </Container>
  );
}

/*6 st filmer cards med knapp till biljetter. ( Knappar görs sedan som komponenter )*/

function FilmerStart() {
  return (
      <Container>
    <Row xs={1} md={3} className="g-5">
      
        <Col>
          <Card>
            <Card.Img variant="top" src={Spidermanfilm} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>

         <Col>
          <Card>
            <Card.Img variant="top" src={Mulanfilm} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>

         <Col>
          <Card>
            <Card.Img variant="top" src={TMNT} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>

         <Col>
          <Card>
            <Card.Img variant="top" src={charlie} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>

         <Col>
          <Card>
            <Card.Img variant="top" src={Batman} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>

         <Col>
          <Card>
            <Card.Img variant="top" src={Thor} />
            <Card.Body>
             <Button variant="danger">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>
      
    </Row>
    </Container>
  );
}

/*Placeholder FOOTER*/

function Footer() {
  return (
    <Container>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#">Footer</Navbar.Brand>
        </Container>
      </Navbar>
    </Container>
  );
}

Start.route = {
  path: "/",
  order: 0,
  label: "Start",
};

