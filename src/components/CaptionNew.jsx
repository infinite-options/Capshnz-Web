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
import LoadingScreen from  "./LoadingScreen";

import worker from '../workers/api-worker.js';
import WebWorker from "../workers/webWorker.js";
import Axios from "axios";
const CaptionNew = () => {

  const webWorker = new WebWorker(worker,  { type: "module", data: { axios: Axios } });
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  // const { publish, subscribe, unSubscribe, detach } = useAbly(
    // `${userData.gameCode}/${userData.roundNumber}`
  // );

  const { publish, subscribe, unSubscribe, detach } = useAbly( userData.gameCode);

  const [caption, setCaption] = useState("");
  const [captionSubmitted, setCaptionSubmitted] = useState(false);
  const isCaptionDisplayed = useRef(false);
  const context = useContext(ErrorContext);
  const [inputCaption, setInputCaption] = useState("");
  // for timer
  const [isPageVisible, setPageVisibility] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(userData.roundTime || 60); // Use userData.roundTime or a default value
  const [remainingTime, setRemainingTime] = useState(0);
  const [isOutofSync, setIsOutOfSync] = useState(false);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [value, setValue] = useState([]);
  let testValue = 0;
  // const [RT, setRT] = useState(userData.roundTime || 60);
  const captionInputRef = useRef(null);
  localStorage.setItem("isOutofSync", false)
  async function sendingError() {
    let code1 = "Caption Page";
    let code2 = "userData.imageURL does not match cookies.userData.imageURL";

    await sendError(code1, code2);

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

    localStorage.setItem("user-caption", event.target.value);
    setCaption(event.target.value);
    // console.log("===", caption);
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

      setCaptionSubmitted(true);
      if (caption !== "" && !timerComplete) {
        numOfPlayersSubmitting = await submitCaption(caption, userData);
      } else if (timerComplete) {
          numOfPlayersSubmitting = await submitCaption(caption, userData);
        }

        //  adding check for timer complete, to proceed to next round
        if(timerComplete || numOfPlayersSubmitting === 0){ //if timer runs out or everyone votes
          let publishTimer = 0;
          
          if(numOfPlayersSubmitting != 0)  publishTimer = 5000;

          function timeout() {

          setTimeout(async () => {
    
            await publish({
              data: {
                message: "Start Vote",
                roundNumber: userData.roundNumber,
                imageURL: userData.imageURL,
                // ,submittedCaptions: submittedCaptions,
              },
            });
          }, publishTimer); // 5000 milliseconds = 5 seconds
        }

        timeout();

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

    return submittedCaptions;
  }

  
  const handleNavigate =()=>{
    let minimizeTime = localStorage.getItem("minimize-time");
    // console.log("minimize time", minimizeTime)
    if(document.hidden){
      let remTime = localStorage.getItem("remaining-time");
    
    
    let currentTime = new Date().getTime();
    // console.log("current time",currentTime)
    let diff;
    if(minimizeTime == 0){
      diff  =  0
    }else{
      diff = currentTime - minimizeTime;
    }
    diff = Math.ceil(diff / 1000);
    // console.log("minimizeTime, remTime, diff, rem - diff",minimizeTime,remTime, diff, remTime-diff)
    let val = remTime - diff;
    // console.log("here diff is less that zero, isOutofSync", val, localStorage.getItem("isOutofSync"));
    if(val < -4) {
      
      setIsOutOfSync(true)
      localStorage.setItem("isOutofSync", true)

      // console.log("isOutofSync 195",isOutofSync)
    }
    // if (!isOutofSync) {
    }
    let isDeSync = localStorage.getItem("isOutofSync")
    // console.log("desync", isDeSync)
    setLoadSpinner(true);
    // console.log("212 loadSpinner", loadSpinner)
  if(isDeSync == "false"){
    localStorage.setItem("minimize-time",  0);
    // console.log("here 210")
    localStorage.setItem("remaining-time",  0);
    localStorage.removeItem("user-caption")
    navigate("/VoteImage", { state: userData });
  } else {
    if(!userData.host){
    setLoadSpinner(true);
    localStorage.setItem("isOutofSync", false);
    localStorage.removeItem("user-caption")
    setTimeout(()=>{
      navigate("/MidGameWaitingRoom", {state: userData})
    }, 2000)
  }
  }


} 

  useEffect(() => {

    subscribe((event) => {

      if (event.data.message === "Start Vote") {
        handleNavigate();
      }
    });
  
  }, [userData]);


  useEffect(() => {
    // console.log("isOutofSync line 267", isOutofSync);
  }, [isOutofSync]);

  useEffect(() => {
    
    // console.log("value line 216", value, testValue);
    
  }, [value]);


  useEffect(() => {
    const handleVisibilityChange = () => {

      if (document.hidden) {

        // Page is not visible, pause the timer and save time remaining
        setTimeRemaining(timeRemaining);
        localStorage.setItem("remaining-time", remainingTime);
        localStorage.setItem("minimize-time", new Date().getTime());
        // console.log("here 257 ------> timeRemaining, remainingTime",timeRemaining,remainingTime, localStorage.getItem("remaining-time"))
        
        webWorker.postMessage(["start-timeout", userData, remainingTime,localStorage.getItem("user-caption")]);
        setPageVisibility(false);

      } else {
        // Page is visible again, resume the timer
        let minimizeTime = localStorage.getItem("minimize-time");
        let currentTime = new Date().getTime();
        let diff = currentTime - minimizeTime;
        diff = Math.floor(diff / 1000);
        webWorker.postMessage("exit");
        setPageVisibility(true);

        if(timeRemaining - diff < 0){

          setTimeRemaining(timeRemaining - diff);
          // localStorage.setItem("remaining-time", remainingTime);
        // localStorage.setItem("remaining-time", remainingTime);
        // console.log("timeRemaining",timeRemaining - diff)
        // console.log("remainingTime", remainingTime);
      }else if(timeRemaining - diff >= 0){
        setTimeRemaining(timeRemaining - diff);
      }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

  }, [remainingTime]);

  return (
    <div>
      { (localStorage.getItem("isOutofSync") == "true") && <LoadingScreen />}
    <div
      style={{
        background: "#7580B5D9",
        width: "100%",
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        paddingBottom: "2rem",
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
                width: "90%",
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
                style={{
                  width: "96%",
                  height: "96%",
                  borderRadius: "0",
                  objectFit: "contain",
                }}
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
                isPlaying = {isPageVisible}

                duration={timeRemaining}
                colors="#000000"
                background="#566176"
                fontFamily="Grandstander"
                fontWeight="700"
                fontSize="30"
                onComplete={() => {

                  submitButton(true);

                }}
              >
                {({ remainingTime }) => {
                   setRemainingTime(remainingTime);
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
                width: "90%",
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
                  width: "90%",
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
    </div>
  );
};
export default CaptionNew;
