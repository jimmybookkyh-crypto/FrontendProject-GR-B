import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { AGE_OPTIONS, type AgeLimit } from "../utils/ageLimit"; 
import "../styles/buttons.css";

export type FilterTab<T extends string> = {
  value: T;
  label: string;
};

type FilterButtonsProps<T extends string> = {
  tabs?: FilterTab<T>[];
  activeFilter?: T;
  onSelectFilter?: (filter: T) => void;
  ageLimit: AgeLimit;
  onSelectAgeLimit: (limit: AgeLimit) => void;
};

export default function FilterButtons<T extends string>({
  tabs = [],
  activeFilter,
  onSelectFilter,
  ageLimit,
  onSelectAgeLimit,
}: FilterButtonsProps<T>) {
  const selectedAge = AGE_OPTIONS.find((option) => option.value === ageLimit);
  const toggleLabel =
    ageLimit === null ? "Åldersgräns" : `Åldersgräns: ${selectedAge?.label}`;

  return (
    <Container className="filter-sektion">
      <Row className="g-2 g-md-4 d-flex justify-content-center">
        {tabs.map((tab) => (
          <Col key={tab.value} xs={12} md={4}>
            <Button
              variant="outline-dark"
              size="lg"
              className="w-100 filter-knapp"
              active={activeFilter === tab.value}
              onClick={() => onSelectFilter?.(tab.value)}
            >
              {tab.label}
            </Button>
          </Col>
        ))}

        <Col xs={12} md={5}>
          <Dropdown className="w-100">
            <Dropdown.Toggle
              id="filter-aldersgrans"
              variant="outline-dark"
              size="lg"
              className="w-100 filter-knapp wider"
              active={ageLimit !== null}
              aria-label={`Filtrera på åldersgräns, valt: ${selectedAge?.label ?? "Alla åldrar"}`}
            >
              {toggleLabel}
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 menu">
              {AGE_OPTIONS.map((option) => (
                <Dropdown.Item
                  key={option.label}
                  as="button"
                  active={option.value === ageLimit}
                  onClick={() => onSelectAgeLimit(option.value)}
                >
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
    </Container>
  );
}
