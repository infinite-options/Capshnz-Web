import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "../styles/Landing.css";
import { addUser } from "../util/Api";

const UserInfo = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;
  const [name, setName] = useState(userData.name);
  const [alias, setAlias] = useState(userData.alias);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleAliasChange = (event) => {
    setAlias(event.target.value);
  };

  const hasAnyNameChanged = () => {
    const { prevName, prevAlias } = userData;
    if (prevName !== name || prevAlias !== alias) return true;
    return false;
  };

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      const updatedUserData = {
        ...userData,
        name,
        alias,
      };
      if (hasAnyNameChanged()) await addUser(updatedUserData);
      if (userData.user_code === "TRUE")
        // navigate("/JoinGame", { state: updatedUserData });
        navigate("/StartGame", { state: updatedUserData });
      else navigate("/Confirmation", { state: updatedUserData });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Container className="container" fluid>
        <Row className="d-flex justify-content-center pt-5">
          <Form.Group as={Col} md="10">
            <Form.Label>Enter Your Name</Form.Label>
            <Form.Control
              required
              value={name}
              type="text"
              placeholder="Enter your name here..."
              onChange={handleNameChange}
            />
          </Form.Group>
        </Row>
        <Row className="d-flex justify-content-center pt-5">
          <Form.Group as={Col} md="10">
            <Form.Label>
              What do you want to use as your Screen Name?
            </Form.Label>
            <Form.Control
              required
              value={alias}
              type="text"
              placeholder="Enter screen name here..."
              onChange={handleAliasChange}
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

export default UserInfo;
