import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import { ReactComponent as Polygon } from "../assets/Polygon 3.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";
const StartGame = () => {
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
      navigate("/ChooseScoring", { state: updatedUserData });
    } catch (error) {
      handleApiError(error, createNewGameButton, context);
    } finally {
      setCreateLoading(false);
    }
    //   navigate("/ChooseScoring");
  };

  const joinGameButton = async (event) => {
    event.preventDefault();
    try {
      setJoinLoading(true);
      if (!(await checkGameCode(gameCode))) return;
      const updatedUserData = {
        ...userData,
        gameCode,
        roundNumber: 1,
        host: false,
      };
      try {
        console.log(updatedUserData);
        await joinGame(updatedUserData);
      } catch (error) {
        if (error.response && error.response.status === 409) console.error("Error:", error);
        else throw error;
      }
      console.log("Navigating to WaitingRoom from StartGame - after joining game");
      navigate("/WaitingRoom", { state: updatedUserData });
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
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        minHeight: "100vh",
        background: "rgba(241, 205, 92, 0.73)",
        overflowX: "hidden",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <Container className='g-0' fluid>
        <Row className='text-center'>
          <Col>
            <div
              style={{
                width: "100%",
                color: "white",
                fontSize: "40px",
                fontFamily: "Grandstander",
                fontWeight: "800",
                wordWrap: "break-word",
                marginBottom: "2rem",
              }}
            >
              Welcome
              <br />
              {userData.name}!
            </div>
          </Col>
        </Row>
        <Form onSubmit={joinGameButton} className='g-0'>
          <Row className='text-center g-0' style={{ marginLeft: "auto", marginRight: "auto" }}>
            <Col>
              <Form.Group>
                <Form.Label
                  style={{
                    width: "330px",
                    color: "white",
                    fontSize: "30px",
                    fontFamily: "Grandstander",
                    fontWeight: "600",
                    wordWrap: "break-word",
                  }}
                >
                  Enter Game Code
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
                    marginRight: "auto",
                    marginLeft: "auto",
                  }}
                  required
                  value={gameCode}
                  type='text'
                  placeholder='Enter game code here...'
                  onChange={handleGameCodeChange}
                  inputMode='numeric'
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className='text-center py-3 g-0' style={{ marginRight: "auto", marginLeft: "auto" }}>
            <Col>
              <Button
                variant='success'
                type='submit'
                disabled={isJoinLoading}
                style={{
                  minWidth: 180,
                  minHeight: 35,
                  background: "#46C3A6",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 23,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginRight: "auto",
                  marginLeft: "auto",
                }}
              >
                {isJoinLoading ? "Joining..." : "Join Game"}
              </Button>
            </Col>
          </Row>
        </Form>

        {/* <div
        style={{
          display: "grid",
          placeItems: "center",
          //overflow: "scroll",
        }}
      > */}
        <Row
          className='text-center py-3 g-0'
          style={{
            width: 380,
            color: "white",
            fontSize: 20,
            fontFamily: "Grandstander",
            fontWeight: "600",
            wordWrap: "break-word",
            marginRight: "auto",
            marginLeft: "auto",
            marginTop: "4rem",
          }}
        >
          <Col>Want to provide game feedback?</Col>
        </Row>
        <Row className='text-center'>
          <Col style={{ position: "relative" }}>
            <Polygon style={{ position: "relative", top: "2px", left: "-30px" }} />
            <Button
              variant='warning'
              onClick={handleFeedback}
              style={{
                minWidth: 218,
                minHeight: 38,
                background: "#46C3A6",
                borderRadius: 30,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 23,
                fontFamily: "Grandstander",
                fontWeight: "600",
                wordWrap: "break-word",
                marginRight: "auto",
                marginLeft: "auto",
              }}
            >
              Provide Feedback
            </Button>
          </Col>
        </Row>
        {/* </Container>
        <Container
          style={{
            //paddingTop: "10px",
            marginTop: "60px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          fluid
        > */}
        <Row
          className='text-center py-4'
          style={{
            width: 380,
            color: "white",
            fontSize: 20,
            fontFamily: "Grandstander",
            fontWeight: "600",
            wordWrap: "break-word",
            marginRight: "auto",
            marginLeft: "auto",
            marginTop: "4rem",
          }}
        >
          <Col>Want to create your own game?</Col>
        </Row>
        <Row className='text-center' style={{ marginTop: "16px" }}>
          <Col style={{ position: "relative" }}>
            <Polygon style={{ position: "relative", top: "2px", left: "-30px" }} />
            <Button
              variant='primary'
              onClick={createNewGameButton}
              disabled={isCreateLoading}
              style={{
                minWidth: 200,
                minHeight: 35,
                background: "#46C3A6",
                borderRadius: 30,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 23,
                fontFamily: "Grandstander",
                fontWeight: "600",
                wordWrap: "break-word",
                marginRight: "auto",
                marginLeft: "auto",
              }}
            >
              {isCreateLoading ? "Creating..." : "Host a Game"}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* </div> */}
    </div>
  );
};

export default StartGame;
