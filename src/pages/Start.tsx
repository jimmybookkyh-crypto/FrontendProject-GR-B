import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
/*import Carousel from 'react-bootstrap/Carousel'; */
/*import ExampleCarouselImage from 'components/ExampleCarouselImage';*/
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


export default function Start() {
  return (
    <>
      <NavBar />
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
        <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

/*Hero-section med slides  ---- Saknar componets med bilder.

function HeroCarousel() {
  return (
    <Carousel>
      <Carousel.Item>
        <ExampleCarouselImage text="First slide" />
        <Carousel.Caption>
          <h3>First slide label</h3>
          <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <ExampleCarouselImage text="Second slide" />
        <Carousel.Caption>
          <h3>Second slide label</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <ExampleCarouselImage text="Third slide" />
        <Carousel.Caption>
          <h3>Third slide label</h3>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur.
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
} */

/* 3 filter knappar placeholder ( Görs sedan som komponenter ) */

function SizesExample() {
  return (
    <Container className="mb-4">
      <Row className="g-3">
        <Col>
          <Button className="w-100">Idag</Button>
        </Col>

        <Col>
          <Button className="w-100">Imorgon</Button>
        </Col>

        <Col>
          <Button className="w-100">Kalender</Button>
        </Col>
      </Row>
    </Container>
  );
}

/*6 st filmer cards med knapp till biljetter. ( Knappar görs sedan som komponenter )*/

function FilmerStart() {
  return (
    <Row xs={1} md={3} className="g-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <Col key={idx}>
          <Card>
            <Card.Img variant="top" src="holder.js/300px350" />
            <Card.Body>
             <Button variant="primary">Biljetter</Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
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

