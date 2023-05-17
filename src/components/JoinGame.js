import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { ably, addUser, checkGameCode, joinGame } from "../util/Api";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import "../styles/Landing.css";

const JoinGame = () => {
  const [gameCode, setGameCode] = useState("");
  const navigate = useNavigate(),
    location = useLocation();
  const userData = location.state;
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isJoinLoading, setJoinLoading] = useState(false);
  const context = useContext(ErrorContext);

  const handleGameCodeChange = (event) => {
    setGameCode(event.target.value);
  };

  const createNewGameButton = async (event) => {
    try {
      setCreateLoading(true);
      const playerInfo = await addUser(userData);
      const updatedUserData = {
        ...userData,
        roundNumber: 1,
        host: true,
        playerUID: playerInfo.user_uid,
      };
      navigate("/ScoreType", { state: updatedUserData });
    } catch (error) {
      handleApiError(error, createNewGameButton, context);
    } finally {
      setCreateLoading(false);
    }
  };

  const joinGameButton = async (event) => {
    event.preventDefault();
    try {
      setJoinLoading(true);
      if (!(await checkGameCode(gameCode))) return;
      const updatedUserData = {
        ...userData,
        roundNumber: 1,
        host: false,
      };
      try {
        await joinGame(updatedUserData);
        const channel = ably.channels.get(`BizBuz/${updatedUserData.gameCode}`);
        channel.publish({ data: { message: "New Player Joined Lobby" } });
      } catch (error) {
        if (error.response && error.response.status === 409)
          console.error(error);
        else throw error;
      }
      navigate("/Waiting", { state: updatedUserData });
    } catch (error) {
      handleApiError(error, joinGameButton, context);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleFeedback = () => {
    navigate("/Feedback", { state: userData });
  };

  return (
    <div className="container">
      <Form onSubmit={joinGameButton}>
        <Container fluid>
          <Row className="text-center py-5">
            <Col>
              <h2>Welcome {userData.name}!</h2>
            </Col>
          </Row>
          <Row className="d-flex justify-content-center">
            <Form.Group as={Col} md="10">
              <Form.Label>Enter Game Code</Form.Label>
              <Form.Control
                required
                value={gameCode}
                type="text"
                placeholder="Enter game code here..."
                onChange={handleGameCodeChange}
              />
            </Form.Group>
          </Row>
          <Row className="text-center py-3">
            <Col>
              <Button variant="success" type="submit" disabled={isJoinLoading}>
                {isJoinLoading ? "Joining..." : "Join Game"}
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
      <Container style={{ paddingTop: "200px" }} fluid>
        <Row className="text-center py-3">
          <Col>Want to provide game feedback?</Col>
        </Row>
        <Row className="text-center">
          <Col>
            <Button variant="warning" onClick={handleFeedback}>
              Provide Feedback
            </Button>
          </Col>
        </Row>
      </Container>
      <Container style={{ paddingTop: "10px" }} fluid>
        <Row className="text-center py-3">
          <Col>Want to create your own game?</Col>
        </Row>
        <Row className="text-center">
          <Col>
            <Button
              variant="primary"
              onClick={createNewGameButton}
              disabled={isCreateLoading}
            >
              {isCreateLoading ? "Creating..." : "Host a Game"}
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default JoinGame;
