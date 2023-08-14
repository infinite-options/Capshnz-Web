import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import { createGame, joinGame } from "../util/Api.js";
import { ErrorContext } from "../App.js";
import { handleApiError } from "../util/ApiHelper.js";
import { ReactComponent as Polygon } from "../assets/Polygon 4.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";

const ChooseRounds = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const [roundInfo, setRoundInfo] = useState({
    numOfRounds: 10,
    roundTime: 60,
  });
  const [isLoading, setLoading] = useState(false);
  const context = useContext(ErrorContext);
  const { publish } = useAbly(userData.gameCode);
  // const continueButton = async (event) => {
  //     navigate("/SelectDeckPrev", { state: userData });
  // };

  function handleChange(event) {
    if (event.target.name === "numOfRounds") {
      setRoundInfo({
        ...roundInfo,
        numOfRounds: parseInt(event.target.value),
      });
    } else if (event.target.name === "roundTime") {
      setRoundInfo({
        ...roundInfo,
        roundTime: parseInt(event.target.value),
      });
    }
  }

  function validateRoundInfo() {
    if (
      !Number.isFinite(roundInfo.numOfRounds) ||
      roundInfo.numOfRounds < 1 ||
      roundInfo.numOfRounds > 20
    ) {
      alert("Please enter 1 - 20 rounds.");
      return false;
    } else if (
      !Number.isFinite(roundInfo.roundTime) ||
      roundInfo.roundTime < 1 ||
      roundInfo.roundTime > 120
    ) {
      alert("Please enter a value less than 120 seconds.");
      return false;
    }
    return true;
  }

  async function continueButton() {
    try {
      setLoading(true);
      if (!validateRoundInfo()) return;

      const gameInfo = await createGame(
        userData.playerUID,
        roundInfo.numOfRounds,
        roundInfo.roundTime,
        userData.scoreType
      );

      if (userData.playAgain) {
        await publish({
          data: {
            message: "Start Again",
            gameCode: gameInfo.game_code,
          },
        });
      }
      const updatedUserData = {
        ...userData,
        deckSelected: false,
        numOfRounds: roundInfo.numOfRounds,
        roundTime: roundInfo.roundTime,
        gameUID: gameInfo.game_uid,
        gameCode: gameInfo.game_code,
      };
      setUserData(updatedUserData);
      setCookie("userData", updatedUserData, { path: "/" });
      await joinGame(updatedUserData);
      navigate("/WaitingRoom", { state: updatedUserData });
    } catch (error) {
      handleApiError(error, continueButton, context);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        background: "rgba(153, 90, 98, 0.70)",
        overflow: "scroll",
      }}
    >
      <Form>
        <Container fluid>
          <Row style={{ marginLeft: "8px" }}>
            <Form.Group as={Col} md="10">
              <Form.Label
                style={{
                  width: "330px",
                  color: "white",
                  fontSize: "32px",
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginTop: "64px",
                }}
              >
                Number of Rounds
              </Form.Label>
              <Form.Control
                style={{
                  width: 330,
                  height: 50,
                  background: "white",
                  borderRadius: 40,
                  color: "black",
                  fontSize: 23,
                  fontFamily: "Grandstander",
                  fontWeight: "500",
                  wordWrap: "break-word",
                }}
                required
                type="text"
                placeholder="Enter # of rounds here..."
                onChange={handleChange}
                name="numOfRounds"
                // defaultValue="10"
                inputMode="numeric"
              />
            </Form.Group>
          </Row>
          <Row
            className="text-center py-3"
            style={{
              marginLeft: "64px",
              marginTop: "8px",
              width: 250,
              height: 73,
              color: "white",
              fontSize: 24,
              fontFamily: "Grandstander",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            <Col> 1 image per round </Col>
          </Row>
          <Row style={{ marginLeft: "8px", marginTop: "160px" }}>
            <Form.Group as={Col} md="10">
              <Form.Label
                style={{
                  width: "330px",
                  color: "white",
                  fontSize: "32px",
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginTop: "64px",
                }}
              >
                Round Time
              </Form.Label>
              <Form.Control
                style={{
                  width: 330,
                  height: 50,
                  background: "white",
                  borderRadius: 40,
                  color: "black",
                  fontSize: 23,
                  fontFamily: "Grandstander",
                  fontWeight: "500",
                  wordWrap: "break-word",
                }}
                required
                type="text"
                placeholder="Enter # of secondes here..."
                onChange={handleChange}
                name="roundTime"
                // defaultValue="60"
                inputMode="numeric"
              />
            </Form.Group>
          </Row>
          <Row
            className="text-center py-3"
            style={{
              marginLeft: "64px",
              marginTop: "8px",
              width: 250,
              height: 73,
              color: "white",
              fontSize: 24,
              fontFamily: "Grandstander",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          >
            <Col> We recommend 60 </Col>
          </Row>
          <Row
            className="text-center py-3"
            style={{ marginLeft: "90px", marginTop: "64px" }}
          >
            <Col>
              <Button
                variant="success"
                type="submit"
                disabled={isLoading}
                onClick={continueButton}
                style={{
                  width: 330,
                  height: 50,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 40,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "-79px",
                }}
              >
                {isLoading ? "Loading..." : "Continue"}
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
    </div>
  );
};

export default ChooseRounds;
