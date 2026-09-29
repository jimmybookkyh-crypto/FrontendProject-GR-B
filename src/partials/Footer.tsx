
import { Container, Row, Col, Card} from "react-bootstrap"

import logo from "../assets/img/logo.png"
export default function footer(){

    return (
        <Container>
            <Row>
                <Col>
                    <Card>
                        <Card.Img src={logo}></Card.Img>
                    </Card>
                </Col>
                <Col>
                    <Card></Card>
                </Col>
                <Col>
                    <Card></Card>
                </Col>
            </Row>
        </Container>
    );
}