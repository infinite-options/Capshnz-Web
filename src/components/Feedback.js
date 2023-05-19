import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addFeedback } from "../util/Api";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "../styles/Landing.css";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addFeedback(userData, feedback);
    navigate("/JoinGame", { state: userData });
  };

  return (
    <Form className="container" onSubmit={handleSubmit}>
      <Container fluid>
        <Row className="text-center py-5">
          <Col>Tell us what you think</Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <Form.Group as={Col} md="10">
            <Form.Control
              required
              value={feedback}
              as="textarea"
              placeholder="Enter feedback here..."
              style={{ height: "100px" }}
              onChange={handleFeedbackChange}
            />
          </Form.Group>
        </Row>
        <Row className="text-center py-3">
          <Col>
            <Button variant="success" type="submit">
              Enter
            </Button>
          </Col>
        </Row>
      </Container>
    </Form>
  );
};

export default Feedback;
