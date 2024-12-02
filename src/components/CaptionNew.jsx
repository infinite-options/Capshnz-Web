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
import Axios from "axios";
const CaptionNew = () => {

  const webWorker  = new Worker(new URL('../workers/api-worker.js', import.meta.url))
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
  
  console.log("here0:",localStorage.getItem("isOutofSync"))
  // const [RT, setRT] = useState(userData.roundTime || 60);
  const captionInputRef = useRef(null);
  localStorage.setItem("isOutofSync", false)
  let isCaptionSubmitted = useRef(false);
  async function sendingError() {
    let code1 = "Caption Page";
    let code2 = "userData.imageURL does not match cookies.userData.imageURL";

    await sendError(code1, code2);

  }
  useEffect(() => {
    isCaptionSubmitted.current = captionSubmitted
  }, [captionSubmitted])
  useEffect(() => {
    // localStorage.removeItem("minimize-time")
    localStorage.setItem("minimize-time", 0)
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
      console.log("line137 first", captionSubmitted)
      setCaptionSubmitted(true);
      console.log("line139 after setting", captionSubmitted)
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
  async function autoSubmitCaption() {
    try {
      const result = await submitCaption("", userData); // Submit empty caption for this player
      console.log("Auto-submitted caption:", result);
      setCaptionSubmitted(true);
  
      // Notify server about auto-submission if needed
      // await publish({
      //   data: {
      //     message: "AutoSubmit",
      //     playerUID: userData.playerUID,
      //     roundNumber: userData.roundNumber,
      //     caption: "",
      //   },
      // });
    } catch (error) {
      handleApiError(error, autoSubmitCaption, context);
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
    console.log("here in navigate 190, captionSubmitted, document hidden, time remaining",isCaptionSubmitted.current , document.hidden, localStorage.getItem("remaining-time"))
    
    if( isCaptionSubmitted.current && document.hidden && !userData.host) {
      // if caption is submitted and user leaves the room,
      navigate("/MidGameWaitingRoom", {state: userData})
    }
    let minimizeTime = localStorage.getItem("minimize-time");
    let hostTime = false;
    console.log("minimize time, remTime", minimizeTime, localStorage.getItem("remaining-time"))
    if(document.hidden){
      let remTime = localStorage.getItem("remaining-time");
      // remTime = parseInt
    // userData.host ? console.log("host hidden") : console.log("not-host hidcden")
    
    let currentTime = new Date().getTime();
    console.log("current time, minimize time , their diff",currentTime, minimizeTime , currentTime - parseInt(minimizeTime))
    let diff;
    if(parseInt(minimizeTime) == 0){
      diff  =  0
    }else{
      diff = currentTime - parseInt(minimizeTime);
    }
    diff = Math.ceil(diff / 1000);
    console.log(" remTime, diff, rem - diff",remTime, diff, remTime-diff)
    let val = parseInt(remTime) - diff;
    console.log("here diff is less that zero, isOutofSync", val, localStorage.getItem("isOutofSync"));
    if(val < -4) {
      isCaptionSubmitted.current = true;
      setIsOutOfSync(true)
      localStorage.setItem("isOutofSync", true)

    }
    }
    let isDeSync = localStorage.getItem("isOutofSync")
    console.log("desync is hidden", isDeSync, document.hidden)
    setLoadSpinner(true);
  if(isDeSync == "false"){
    let curr = Date.now()
    let rem = localStorage.getItem("remaining-time")

    let diff=  minimizeTime == 0 ? 0 : curr - parseInt(minimizeTime);
    diff = Math.floor(diff/1000);
    console.log("here 238, diff, minimizeTime",diff, minimizeTime, localStorage.getItem("minimize-time"))

    // localStorage.setItem("minimize-time",  0);
    // localStorage.setItem("remaining-time",  0);

    // if(userData.host && (diff>= (userData.roundTime+ parseInt(rem)) )){
      if(userData.host && (diff>= (userData.roundTime) )){
        // setTimeout(()=>{
        console.log("navigate -score 240")
      // if( !document.hidden)
      localStorage.setItem("minimize-time",  0);
      localStorage.setItem("remaining-time",  0);
          navigate("/ScoreboardNew", { state: userData });
      // }, 2000)
    }else{
      console.log("navigate -vote 245", document.hidden)
      if( !document.hidden){
        localStorage.setItem("minimize-time",  0);
        localStorage.setItem("remaining-time",  0);
      navigate("/VoteImage", { state: userData })
    
      }
    }
  } else {
    if(!userData.host ){
    setLoadSpinner(true);
    localStorage.setItem("isOutofSync", false);
    localStorage.removeItem("user-caption")
    setTimeout(()=>{
      console.log("navigate -middleware 254")
      navigate("/MidGameWaitingRoom", {state: userData})
    }, 2000)
  }else{
    if( !document.hidden){
      // let curr = Date.now()
      let curr = new Date().getTime()
      console.log("curr, minimize time, curr - minimize time", curr, minimizeTime , curr - parseInt(minimizeTime))
    let diff=  curr - parseInt(minimizeTime);
    diff = Math.floor(diff/1000);
    console.log("here 238 user.data.roundTime",diff, userData.roundTime)

    let rem = parseInt(localStorage.getItem("remaining-time"))
    console.log("rem time 279", rem)
    if( diff>= (userData.roundTime + rem) ) {
      console.log("274 diff, userData.roundTime,rem", diff, userData.roundTime,rem)
      hostTime = true
    }

    if( hostTime ){
    // setTimeout(()=>{
      console.log("navigating to score baord", document.hidden, new Date())
      // if(!document.hidden)
      console.log("navigate -score 271")
      localStorage.setItem("minimize-time",  0);
      localStorage.setItem("remaining-time",  0);
    navigate("/ScoreboardNew", { state: userData });
    // }, 2000)
  }else{
    setTimeout(()=>{
      console.log("navigate -vote 276")
      localStorage.setItem("minimize-time",  0);
      localStorage.setItem("remaining-time",  0);
    navigate("/VoteImage", {state: userData})
    }, 2000)
  }
}
}
  }


}
console.log("here1:",localStorage.getItem("isOutofSync"))
useEffect(() => {
  if (localStorage.getItem("isOutofSync") === "true") {
    console.log("User is out of sync, auto-submitting caption.");
    autoSubmitCaption();
  }
}, []); 

  useEffect(() => {
    subscribe((event) => {

      if (event.data.message === "Start Vote") {
        console.log("getting called from subscribe 294, time --->", new Date().getTime(), captionSubmitted)
        handleNavigate();
      }

      if(userData.host && event.data.message === "Start ScoreBoard"){
        setCookie("userData", userData, {path: '/'})
        navigate("/ScoreBoardNew", { state: userData })

      }
    });
  
  }, [userData]);

  useEffect(() => {
    const handleVisibilityChange = () => {

      if (document.hidden) {
        console.log("after api worker the code should come here")
        console.log(`Player ${userData.playerUID} is going out of sync.`);
        // Page is not visible, pause the timer and save time remaining
        setTimeRemaining(timeRemaining);
        localStorage.setItem("remaining-time", remainingTime);
        localStorage.setItem("minimize-time", new Date().getTime());
        localStorage.setItem("isOutofSync", true);
        autoSubmitCaption(); 
        // console.log("here 257 ------> timeRemaining, remainingTime",timeRemaining,remainingTime, localStorage.getItem("remaining-time"))
        // if(!captionSubmitted)
        let userCaption = localStorage.getItem("user-caption") || "";
        if(!captionSubmitted){
          console.log("here line 313 scaptionsubmited variable --->", captionSubmitted)
          webWorker.postMessage(["start-timeout", userData, remainingTime,userCaption]);
        }
        setPageVisibility(false);

      } else {
        console.log(`Player ${userData.playerUID} is back.`);
            /* eslint-disable-next-line no-restricted-globals */
          // self.onmessage = (event) =>{
          //   console.log("on line 70 event on here",event)
          // }

        // Page is visible again, resume the timer
        let minimizeTime = localStorage.getItem("minimize-time");
        console.log("minimizeTime-------> 363 ", minimizeTime)
        let currentTime = new Date().getTime();
        let diff = parseInt(currentTime) - parseInt(minimizeTime);
        diff = Math.floor(diff / 1000);
        setPageVisibility(true);
        // webWorker.addEventListener('message', (event) => {
        //   const [message, userData] = event.data;
        //   console.log('Received message:', message);
        //   console.log('Received userData:', userData);
          
        //   // Process the received message or data here
        // });
    
        console.log("332 page back online, timeremaining, diff", timeRemaining, diff, timeRemaining-diff)
        if(timeRemaining - diff < 0 || captionSubmitted){

          // setTimeRemaining(timeRemaining - diff);
          setTimeRemaining(0);
          console.log("getting called from handleVisibilityChange 331")
          localStorage.setItem("isOutofSync", true)
          autoSubmitCaption();
          handleNavigate()
          // localStorage.setItem("remaining-time", remainingTime);
        // localStorage.setItem("remaining-time", remainingTime);
        // console.log("timeRemaining",timeRemaining - diff)
        console.log("remainingTime, localhsot vvall 339", remainingTime,localStorage.getItem("remaining-time"));
      }else if(timeRemaining - diff >= 0){
        webWorker.postMessage("exit");
        setTimeRemaining(timeRemaining - diff);
      }else {
        console.log(`Player ${userData.playerUID} is still in sync.`);
        localStorage.setItem("isOutofSync", false);
      }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

  }, [remainingTime]);
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       console.log(`Player ${userData.playerUID} is going out of sync.`);
  //       localStorage.setItem("minimize-time", new Date().getTime());
  //       localStorage.setItem("remaining-time", remainingTime);
  //       localStorage.setItem("isOutofSync", true);
  
  //       // Auto-submit only for the current player
  //       autoSubmitCaption(); 
  //     } else {
  //       console.log(`Player ${userData.playerUID} is back.`);
  //       const minimizeTime = parseInt(localStorage.getItem("minimize-time"), 10);
  //       const currentTime = new Date().getTime();
  //       const diff = Math.floor((currentTime - minimizeTime) / 1000);
  
  //       const updatedTimeRemaining = remainingTime - diff;
  //       setTimeRemaining(updatedTimeRemaining);
  
  //       // Only auto-submit if this player is out of sync
  //       if (updatedTimeRemaining <= 0 || localStorage.getItem("isOutofSync") === "true") {
  //         console.log(`Auto-submitting caption for Player ${userData.playerUID}`);
  //         autoSubmitCaption();
  //       } else {
  //         console.log(`Player ${userData.playerUID} is still in sync.`);
  //         localStorage.setItem("isOutofSync", false);
  //       }
  //     }
  //   };
  //   console.log("in handle:RT",remainingTime)
  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // }, [remainingTime]);
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
      <Container fluid>
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
