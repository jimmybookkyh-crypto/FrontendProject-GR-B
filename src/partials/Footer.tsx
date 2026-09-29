import { Container, Row, Col, Figure,} from "react-bootstrap"
import { useNavigate } from "react-router";

import logo from "../assets/img/logo.png"
export default function footer(){
  const navigate = useNavigate();

  return (
    <footer className="border-secondary py-4 mt-auto" style = {{backgroundColor: "#100E1C"}}>
      <Container fluid className="px-md-5">
        <Row className="align-items-center text-center text-md-start">
          {/* Vänster spalt: Cookies & Om oss */}
          <Col md={4} className="mb-3 mb-md-0">
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <span  style={{ color: '#f5f7fa' }} 
                  role="button"
                  onClick={() => alert("Cookies-information")}
                >
                  Cookies
                </span>
              </li>
              <li>
                <span  style={{ color: '#f5f7fa' }} 
                  role="button"
                  onClick={() => navigate("/about")}
                >
                  Om oss
                </span>
              </li>
            </ul>
          </Col>

          {/* Mitt spalt: Logga */}
          <Col className= "d-flex justify-content-center align-items-center">
            <Figure className="mb-0">
                <Figure.Image className="mb-0"
                src={logo}
                width={120}
                height={100}
                alt= "företags logga"
                />
            </Figure>
          </Col>

          {/* Höger spalt: Event och Filmer */}
          <Col md={4} className="text-md-end">
            <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
              <li>
                <span  style={{ color: '#f5f7fa' }} 
                  role="button"
                  onClick={() => navigate("/moviecatalog")}
                >
                  Filmer
                </span>
              </li>
              <li>
                <span  style={{ color: '#f5f7fa' }} 
                  role="button"
                  onClick={() => navigate("/event")}
                >
                  Händelser
                </span>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
