import Form from "react-bootstrap/Form";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useState, useEffect, useRef, useContext } from "react";
import * as ReactBootStrap from "react-bootstrap";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import "../styles/CaptionNew.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import {
  submitCaption,
  sendError,
  getScoreBoard,
  getSubmittedCaptions,
  getGameImageForRound,
} from "../util/Api";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { ReactComponent as CloseButton } from "../assets/close-button.svg";

const CaptionNew = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const { publish, subscribe, unSubscribe, detach } = useAbly(
    `${userData.gameCode}/${userData.roundNumber}`
  );
  const [caption, setCaption] = useState("");
  const [captionSubmitted, setCaptionSubmitted] = useState(false);
  const isCaptionDisplayed = useRef(false);
  const context = useContext(ErrorContext);
  const [inputCaption, setInputCaption] = useState("");

  const captionInputRef = useRef(null);

  async function sendingError() {
    let code1 = "Caption Page";
    let code2 = "userData.imageURL does not match cookies.userData.imageURL";
    // console.log("caption:err")
    await sendError(code1, code2);
    // console.log(cookies.userData.imageURL)
    // console.log("user")
    // console.log(userData.imageURL)
  }
  useEffect(() => {
    async function getCaptionsForUser() {
      const image_URL = await getGameImageForRound(
        userData.gameCode,
        userData.roundNumber
      );
      if (image_URL != userData.imageURL) {
        sendingError();
        const updatedUserData = {
          ...userData,
          imageURL: image_URL,
        };
        setUserData(updatedUserData);
        setCookie("userData", updatedUserData, { path: "/" });
      } else {
        setCookie("userData", userData, { path: "/" });
      }
    }
    const interval = setInterval(() => {
      if (
        !isCaptionDisplayed.current &&
        cookies.userData.imageURL !== userData.imageURL
      ) {
        getCaptionsForUser();
        isCaptionDisplayed.current = true;
      }
    }, 5000);

    return () => {
      clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      unSubscribe();
    };
  }, []);
  async function scoreBoard() {
    const scoreboard = await getScoreBoard(userData);
    scoreboard.sort((a, b) => b.game_score - a.game_score);
    return scoreboard;
  }
  function handleChange(event) {
    setCaption(event.target.value);
    console.log("===", caption);
    setInputCaption(event.target.value);
  }
  async function closeButton() {
    try {
      let scoreboard = userData.scoreBoardEnd;
      if (scoreboard === undefined) {
        scoreboard = await scoreBoard();
        for (let i = 0; i < scoreboard.length; i++) {
          scoreboard[i].game_score = 0;
        }
      }
      await publish({
        data: {
          message: "EndGame caption",
          scoreBoard: scoreboard,
        },
      });
    } catch (error) {
      handleApiError(error, closeButton, context);
    }
  }
  async function submitButton(timerComplete) {
    try {
      let numOfPlayersSubmitting = -1;
      //const modifiedCaption = caption.replace(/'/g, "\\\\'");
      if (caption === "" && !timerComplete) {
        alert("Please enter a valid caption.");
        return;
      }
      //console.log("mod cap =", modifiedCaption);
      setCaptionSubmitted(true);
      if (caption !== "" && !timerComplete) {
        numOfPlayersSubmitting = await submitCaption(caption, userData);
      } else if (timerComplete) {
        numOfPlayersSubmitting = await submitCaption(caption, userData);
      }
      if (numOfPlayersSubmitting === 0) {
        // const submittedCaptions = await getCaptions()

        await publish({
          data: {
            message: "Start Vote",
            // ,submittedCaptions: submittedCaptions,
          },
        });
      }
    } catch (error) {
      handleApiError(error, submitButton, context);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      submitButton(false);
      captionInputRef.current.blur();
    }
  };
  async function getCaptions() {
    const submittedCaptions = await getSubmittedCaptions(userData);
    // console.log("get from service:Caption")
    // console.log(submittedCaptions)
    return submittedCaptions;
  }
  useEffect(() => {
    subscribe((event) => {
      if (event.data.message === "Start Vote") {
        // const updatedUserData = {
        //     ...userData,
        //     captions: event.data.submittedCaptions
        // }
        // setCookie("userData", updatedUserData, { path: '/' })
        // console.log(cookies)
        navigate("/VoteImage", { state: userData });
      } else if (event.data.message === "EndGame caption") {
        detach();
        if (!userData.host) {
          alert("Host has Ended the game");
        }
        const updatedUserData = {
          ...userData,
          scoreBoard: event.data.scoreBoard,
        };
        setUserData(updatedUserData);
        setCookie("userData", updatedUserData, { path: "/" });
        navigate("/FinalScore", { state: updatedUserData });
      }
    });
  }, [userData]);

  return (
    <div
      style={{
        background: "#7580B5D9",
        width: "100%",
        height: "100vh",
        display: "grid",
        placeItems: "center",
        // justifyContent: "center",
        // alignItems: "center",
        // flexDirection: "column",
        overflow: "scroll",
      }}
    >
      <Container fliud>
        <Row className="text-center">
          <Col>
            <CloseButton
              onClick={() => navigate("/StartGame", { state: userData })}
              style={{ position: "absolute", right: 5, top: 5 }}
            />
          </Col>
        </Row>
        <Row className="text-center">
          <Col>
            <div
              style={{
                width: 375,
                height: 365,
                background: "#D9D9D9",
                borderRadius: 0,
                top: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                marginBottom: 20,
                marginTop: 30,
                marginRight: "auto",
                marginLeft: "auto",
                position: "relative",
              }}
            >
              <img
                className="imgCaption"
                src={userData.imageURL}
                alt="Loading Image...."
                style={{ width: "96%", height: "96%", borderRadius: "0" }}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div
              style={{
                width: 76,
                height: 76,
                background: "#566176",
                borderRadius: "50%",
                position: "relative",
                //top: 130,
                //right: 10,
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 30,
                fontFamily: "Grandstander",
                fontWeight: "700",
                wordWrap: "break-word",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "2rem",
                marginBottom: "2rem",
              }}
            >
              <CountdownCircleTimer
                size={76}
                strokeWidth={5}
                isPlaying
                duration={userData.roundTime}
                colors="#000000"
                background="#566176"
                fontFamily="Grandstander"
                fontWeight="700"
                fontSize="30"
                onComplete={() => {
                  if (!captionSubmitted) {
                    submitButton(true);
                  }
                }}
              >
                {({ remainingTime }) => {
                  return (
                    <div className="countdownCaption">{remainingTime}</div>
                  );
                }}
              </CountdownCircleTimer>
            </div>
          </Col>
        </Row>
        {/* <Form>
          <Form.Group> */}
        <Row className="text-center">
          <Col>
            <input
              ref={captionInputRef}
              onKeyDown={handleKeyDown}
              style={{
                width: 391,
                height: 62.38,
                background: "white",
                borderRadius: 40,
                color: "black",
                fontSize: 26,
                fontFamily: "Grandstander",
                fontWeight: "500",
                wordWrap: "break-word",
                border: "none",
                borderColor: "white",
                marginLeft: "auto",
                marginRight: "auto",
                //marginTop: "160px",
              }}
              //value={email}
              type="text"
              placeholder="Enter caption here..."
              onChange={handleChange}
              disabled={captionSubmitted}
              value={inputCaption}
            />
          </Col>
        </Row>
        <Row className="text-center">
          <Col>
            {!captionSubmitted && (
              <Button
                onClick={(event) => submitButton(false)}
                style={{
                  width: 218,
                  height: 54,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 31,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: "100px",
                }}
              >
                Submit
              </Button>
            )}
          </Col>
        </Row>
        <Row className="text-center">
          <Col>
            {captionSubmitted && (
              <div
                style={{
                  fontFamily: "Grandstander",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                <Button
                  style={{
                    width: 218,
                    height: 54,
                    background: "#5E9E94",
                    borderRadius: 30,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",
                    fontSize: 31,
                    fontFamily: "Grandstander",
                    fontWeight: "600",
                    wordWrap: "break-word",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "100px",
                  }}
                >
                  Submitted
                </Button>
                <br />
                Waiting for other players to submit captions...
                <br />
                <ReactBootStrap.Spinner animation="border" role="status" />
              </div>
            )}
          </Col>
        </Row>
        {/* </Form.Group>
        </Form> */}
        <Row className="text-center">
          <Col>
            <div
              style={{
                //paddingTop: "200px",
                //position: "absolute",
                bottom: 20,
                marginTop: 20,
                //left: 0,
                //right: 0,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <PolygonWhiteUpward style={{ marginLeft: "-163px" }} />

              <div
                style={{
                  width: "415px",
                  height: 65,
                  background: "white",
                  borderRadius: 40,
                  //position: "absolute",
                  //top: 805,
                  //left: 7,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "black",
                  fontSize: 37,
                  fontFamily: "Grandstander",
                  fontWeight: "700",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {userData.deckTitle}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
export default CaptionNew;
