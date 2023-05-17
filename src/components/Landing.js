import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { addUserByEmail } from "../util/Api";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "../styles/Landing.css";

const Landing = () => {
  const [isInvalid, setInvalid] = useState(false);
  const [email, setEmail] = useState("");
  const [cookies, setCookie] = useCookies(["email"]);
  const [cookiesUsed, setCookiesUsed] = useState(false);
  const navigate = useNavigate();

  if (!cookiesUsed && cookies.email) {
    setEmail(cookies.email);
    setCookiesUsed(true);
  }

  const handleEmailChange = (event) => {
    const inputEmail = event.target.value;
    setEmail(inputEmail);
    const testEmail = /[\w\d]{1,}@[\w\d]{1,}.[\w\d]{1,}/;
    if (!testEmail.test(inputEmail.toLowerCase())) setInvalid(true);
    else setInvalid(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isInvalid) {
      try {
        const res = await addUserByEmail(email);
        setCookie("email", email, { path: "/" });
        const userData = {
          ...res,
          email: email,
          playerUID: res.user_uid,
        };
        navigate("/UserInfo", { state: userData });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Container className="container" fluid>
        <Row className="text-center py-5">
          <Col>
            <h2>Welcome to Capshnz!</h2>
          </Col>
        </Row>
        <Row className="py-5 ps-4">
          <Col>
            <Link to="/GameRules" className="gameRules">
              <i className="fa fa-info-circle"></i>
              Game Rules
            </Link>
          </Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <Form.Group as={Col} md="10">
            <Form.Label>Enter your Email Address</Form.Label>
            <Form.Control
              required
              value={email}
              type="text"
              placeholder="Enter email here..."
              onChange={handleEmailChange}
              isInvalid={isInvalid}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email.
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="text-center pb-3" style={{ paddingTop: "300px" }}>
          <Col>
            By pressing Enter you agree to let us use cookies to improve game
            performance
          </Col>
        </Row>
        <Row className="text-center pb-5">
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

export default Landing;
