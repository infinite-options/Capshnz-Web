import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import Form from "react-bootstrap/Form";
import { Modal, Row, Col, Button, Container } from "react-bootstrap";
import { useState, useEffect, useRef, useMemo  } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import {
  getSubmittedCaptions,
  postVote,
  sendError,
  getScoreBoard,
} from "../util/Api";
import * as ReactBootStrap from "react-bootstrap";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import React, { useContext } from "react";
import { ReactComponent as CloseButton } from "../assets/close-button.svg";

//worker files
// import worker from '../workers/vote-api-worker.js';
// import WebWorker from "../workers/webWorker.js";
import Axios from "axios";

//for desync
import LoadingScreen from  "./LoadingScreen";

//This function is made to shuffle the sequence of the captions array.
function shuffleArray(array) {

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const VoteImage = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  // const { publish, subscribe, unSubscribe, detach } = useAbly(
  //   `${userData.gameCode}/${userData.roundNumber}`
  // );
  const { publish, subscribe, unSubscribe, detach } = useAbly( userData.gameCode);
   // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [captions, setCaptions] = useState([]);
  const [toggles, setToggles] = useState([]);
  const [isMyCaption, setIsMyCaption] = useState("");
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [votedCaption, setvotedCaption] = useState(-1);
  // const webWorker = new WebWorker(worker,  { type: "module" });
  // const webWorker = new WebWorker(worker,  { type: "module", data: { axios: Axios } });
  const webWorker  = new Worker(new URL('../workers/api-worker.js', import.meta.url))
  // for timer
  const [remainingTime, setRemainingTime] = useState(10);
  const [isPageVisible, setPageVisibility] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(userData.roundTime || 60); // Use userData.roundTime or a default value

  // for desync
  const [loadSpinner, setLoadSpinner] = useState(false);

  // Function to trigger popup
  const triggerPopup = (message) => {
    console.log("popup triggered in vote",message);
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Auto-hide after 3 seconds
  };
  const publishWithPopup = async (data) => {
    console.log("inside publish vote");
    try {
      if (!data.data || !data.data.message) {
        console.error("No message defined in data:", data.data);
        return;
      }
      console.log("Vote publish data:",data.data);
      await publish(data);
      triggerPopup(`Message broadcasted: ${data.data.message}`);
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  };
  const backgroundColors = {
    default: "#D4B551",
    selected: "Green",
    myCaption: "black",
  };
  const isGameEnded = useRef(false);
  const isCaptionSubmitted = useRef(false);
  const [loadingImg, setloadingImg] = useState(true);
  const context = useContext(ErrorContext);
  useEffect(() => {
    if (localStorage.getItem("isOutofSync") === "true") {
      console.log("User is out of sync, auto-submitting vote.");
      autoSubmitVote();
    }
  }, []);
  
  async function autoSubmitVote() {
    try {
      const result = await postVote(null, userData); // Submit null vote for this player
      console.log("Auto-submitted vote:", result);
      setVoteSubmitted(true);
  
      // Notify server about auto-submission if needed
      // await publish({
      //   data: {
      //     message: "AutoSubmitVote",
      //     playerUID: userData.playerUID,
      //     roundNumber: userData.roundNumber,
      //     vote: null,
      //   },
      // });
    } catch (error) {
      handleApiError(error, autoSubmitVote, context);
    }
  }
  // const shuffledCaptions = shuffleArray(captions);
  const shuffledCaptions = useMemo(() => {
    return shuffleArray(captions);
  }, [captions]);

  // ... rest of the com


  if (
    cookies.userData != undefined &&
    cookies.userData.imageURL !== userData.imageURL
  ) {
    async function sendingError() {
      let code1 = "Vote Page";
      let code2 = "userData.imageURL does not match cookies.userData.imageURL";

      await sendError(code1, code2);
    }
    // sendingError()
  }
  async function scoreBoard() {
    const scoreboard = await getScoreBoard(userData);
    scoreboard.sort((a, b) => b.game_score - a.game_score);
    return scoreboard;
  }
  async function setSubmittedCaptions(submittedCaptions) {
    // setisCaptionSubmitted(true)
    let tempCaptions = [];
    let tempToggles = [];
    let myCaption = "";
    let onlyCaptionSubmitted = "";
    for (let i = 0; i < submittedCaptions.length; i++) {
      if (submittedCaptions[i].caption === "") continue;
      if (submittedCaptions[i].round_user_uid === userData.playerUID)
        myCaption = submittedCaptions[i].caption;
      if (submittedCaptions[i].caption !== "")
        onlyCaptionSubmitted = submittedCaptions[i].caption;

      //const modifiedCaption = submittedCaptions[i].caption.replace(/"/g, "'");
      tempCaptions.push(submittedCaptions[i].caption);
    }
    for (let i = 0; i < tempCaptions.length; i++) {
      tempToggles.push(false);
    }
    setCaptions(tempCaptions);
    setToggles(tempToggles);

    setIsMyCaption(myCaption);
    const updatedUserData = {
      ...userData,
      captions: submittedCaptions,
    };
    setCookie("userData", updatedUserData, { path: "/" });
    if (tempCaptions.length <= 1) {
      await skipVote(tempCaptions, onlyCaptionSubmitted, myCaption);

    }
  }
  async function skipVote(tempCaptions, onlyCaptionSubmitted, myCaption) {
    if (tempCaptions.length === 1 && onlyCaptionSubmitted === myCaption) {
      await postVote(null, userData);
    } else if (
      tempCaptions.length === 1 &&
      onlyCaptionSubmitted !== myCaption
    ) {
      await postVote(onlyCaptionSubmitted, userData);
    } else if (tempCaptions.length === 0) {
      await postVote(null, userData);
    }
    setCookie("userData", userData, { path: "/" });
    navigate("/ScoreboardNew", { state: userData });
  }

  useEffect(() => {

    if (captions.length === 0 && cookies.userData.captions != undefined) {
      setloadingImg(false);
      setSubmittedCaptions(cookies.userData.captions);
      isCaptionSubmitted.current = true;

    }

    if (userData.host && cookies.userData.captions === undefined) {
      async function getCaptions() {
        const submittedCaptions = await getSubmittedCaptions(userData);

        await publishWithPopup(
          { data: {
            message: "Set Vote",
            submittedCaptions: submittedCaptions,
            roundNumber: userData.roundNumber,
            imageURL: userData.imageURL,
          }},
        );
      }
      getCaptions();
    }

    subscribe((event) => {
      if (event.data.message === "Set Vote") {

        isCaptionSubmitted.current = true;
        setloadingImg(false);
        setSubmittedCaptions(event.data.submittedCaptions);
        console.log("Captions received:", event.data.submittedCaptions);
      } else if (event.data.message === "Start ScoreBoard") {

        handleNavigate()
        // setCookie("userData", userData, { path: "/" });
        // navigate("/ScoreboardNew", { state: userData });
      }
    });
  }, [userData]);

  const handleNavigate =()=>{
        setCookie("userData", userData, { path: "/" });
        // let minimizeTime = localStorage.getItem("votepage-minimize-time");
        let minimizeTime = parseInt(localStorage.getItem("votepage-minimize-time"));
    console.log("minimize time", minimizeTime)
    if(document.hidden && !userData.host){
      localStorage.setItem("isOutofSync", true)

    //   let remTime = parseInt(localStorage.getItem("remaining-time-votePage"));
    
    
    // let currentTime = new Date().getTime();
    // console.log("current time",currentTime)
    // let diff;
    // if(minimizeTime == 0){
    //   diff  =  0
    // }else{
    //   diff = currentTime - minimizeTime;
    // }
    // diff = Math.ceil(diff / 1000);
    // console.log("minimizeTime, remTime, diff, rem - diff",minimizeTime,remTime, diff, remTime-diff)
    // let val = remTime - diff;
    // console.log("here diff is less that zero, isOutofSync", val, localStorage.getItem("isOutofSync"));
    // if(val < -1) {
      
    //   // setIsOutOfSync(true)
    //   localStorage.setItem("isOutofSync", true)

    //   // console.log("isOutofSync 195",isOutofSync)
    // }

  }
    let isDeSync = localStorage.getItem("isOutofSync")
    console.log("desync", isDeSync)
  if(isDeSync == "false"){
    localStorage.setItem("votepage-minimize-time",  0);
    console.log("here 210")
    localStorage.setItem("remaining-time-votePage",  0);
    navigate("/ScoreboardNew", { state: userData });
  } else {
    if(!userData.host){
    setLoadSpinner(true);
    localStorage.setItem("isOutofSync", false);

    setTimeout(()=>{
      navigate("/MidGameWaitingRoom", {state: userData})
    }, 2000)
  }
  }


} 



  useEffect(() => {
    localStorage.removeItem("user-caption")
    // localStorage.removeItem("minimize-time")
    subscribe((event) => {
      if (event.data.message === "EndGame vote") {
        detach();
        if (!userData.host && !isGameEnded.current) {
          isGameEnded.current = true;
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
  }, []);
  async function getCaptionsForUser() {
    const submittedCaptions = await getSubmittedCaptions(userData);

    setloadingImg(false);
    setSubmittedCaptions(submittedCaptions);
  }
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isCaptionSubmitted.current) {
        getCaptionsForUser();

        isCaptionSubmitted.current = true;
      }
    }, 5000);

    return () => {
      clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      unSubscribe();
    };
  }, []);

// timer synchronization when screen minimizes
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log(`Player ${userData.playerUID} is going out of sync.`);
      // Page is not visible, pause the timer and save time remaining
      setTimeRemaining(timeRemaining);
      localStorage.setItem("votepage-minimize-time", new Date().getTime());
      localStorage.setItem("remaining-time-votePage", remainingTime);
      localStorage.setItem("isOutofSync", true);

      // Auto-submit only for the current player
      autoSubmitVote(); 
      webWorker.postMessage(["vote-page", userData, remainingTime,null]);

      setPageVisibility(false);

    } else {
      // Page is visible again, resume the timer
      console.log(`Player ${userData.playerUID} is back.`);
      webWorker.postMessage("exit");
      let minimizeTime = parseInt(localStorage.getItem("votepage-minimize-time"));
      let currentTime = new Date().getTime();
      let diff = currentTime - minimizeTime;
      diff = Math.floor(diff / 1000);

      setTimeRemaining(timeRemaining - diff)
      setPageVisibility(true);

      if(timeRemaining - diff < 0 || localStorage.getItem("isOutofSync") === "true"){
        console.log(`Auto-submitting vote for Player ${userData.playerUID}`);
        setTimeRemaining(timeRemaining - diff);
        localStorage.setItem("remaining-time-votePage", remainingTime);
        console.log("timeRemaining",timeRemaining - diff)
        console.log("remainingTime", remainingTime);
        autoSubmitVote();

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
// }, [timeRemaining]);
}, [remainingTime]);
// useEffect(() => {
//   const handleVisibilityChange = () => {
//     if (document.hidden) {
//       console.log(`Player ${userData.playerUID} is going out of sync.`);
//       localStorage.setItem("votepage-minimize-time", new Date().getTime());
//       localStorage.setItem("remaining-time-votePage", remainingTime);
//       localStorage.setItem("isOutofSync", true);

//       // Auto-submit only for the current player
//       autoSubmitVote(); 
//     } else {
//       console.log(`Player ${userData.playerUID} is back.`);
//       const minimizeTime = parseInt(localStorage.getItem("votepage-minimize-time"), 10);
//       const currentTime = new Date().getTime();
//       const diff = Math.floor((currentTime - minimizeTime) / 1000);

//       const updatedTimeRemaining = remainingTime - diff;
//       setTimeRemaining(updatedTimeRemaining);

//       // Only auto-submit if this player is out of sync
//       if (updatedTimeRemaining <= 0 || localStorage.getItem("isOutofSync") === "true") {
//         console.log(`Auto-submitting vote for Player ${userData.playerUID}`);
//         autoSubmitVote();
//       } else {
//         console.log(`Player ${userData.playerUID} is still in sync.`);
//         localStorage.setItem("isOutofSync", false);
//       }
//     }
//   };

//   document.addEventListener("visibilitychange", handleVisibilityChange);

//   return () => {
//     document.removeEventListener("visibilitychange", handleVisibilityChange);
//   };
// }, [remainingTime]);


  async function closeButton() {
    try {
      let scoreboard = userData.scoreBoardEnd;
      if (scoreboard === undefined) {
        scoreboard = await scoreBoard();
        for (let i = 0; i < scoreboard.length; i++) {
          scoreboard[i].game_score = 0;
        }
      }
      await publishWithPopup({data :{
          message: "EndGame vote",
          scoreBoard: scoreboard,
        },
    });
    } catch (error) {
      handleApiError(error, closeButton, context);
    }
  }

  // function updateToggles(index) {
  //   if (captions[index] === isMyCaption) return;
  //   let tempToggles = [];
  //   for (let i = 0; i < toggles.length; i++) {
  //     if (index === i) {
  //       tempToggles.push(true);
  //       setvotedCaption(i);
  //     } else tempToggles.push(false);
  //   }
  //   setToggles(tempToggles);
  // }

  // async function voteButton(timerComplete) {
  //   try {
  //     let numOfPlayersVoting = -1;
  //     // for(let i = 0; i < toggles.length; i++){
  //     //     if(toggles[i] === true){
  //     //         votedCaption = captions[i]
  //     //     }
  //     // }
  //     if (votedCaption === -1 && !timerComplete) {
  //       alert("Please vote for a caption.");
  //       return;
  //     }
  //     setVoteSubmitted(true);
  //     if (votedCaption === -1 && timerComplete) {
  //       numOfPlayersVoting = await postVote(null, userData);
  //     } else if (votedCaption !== -1) {
  //       numOfPlayersVoting = await postVote(captions[votedCaption], userData);
  //     }
  //     if (numOfPlayersVoting === 0) {
  //       await publish({ data: { message: "Start ScoreBoard" } });
  //     }
  //   } catch (error) {
  //     handleApiError(error, voteButton, context);
  //   }
  // }

  function updateToggles(index) {
    if (captions[index] === isMyCaption) return;

    // Update toggles state
    let tempToggles = toggles.map((toggle, i) => i === index);
    setToggles(tempToggles);

    // Call voteButton with the selected caption
    voteButton(index);
  }

  async function voteButton(selectedCaptionIndex) {
    try {
      let numOfPlayersVoting = -1;

      //  commented to allow api call when players who havent voted
      // if (selectedCaptionIndex === -1) {
      //   alert("Please vote for a caption.");
      //   return;
      // }
      console.log("line499 before setting vote", voteSubmitted);
      setVoteSubmitted(true);
      console.log("line501 after setting vote", voteSubmitted);

      //  commented to allow api call when players who havent voted
      // Determine the caption to vote for
      // const selectedCaption = captions[selectedCaptionIndex];

      //  code added to allow allow api call when player hasnt voted
      let selectedCaption = null;
      if(selectedCaptionIndex > -1){
        selectedCaption = captions[selectedCaptionIndex];
      }
      console.log("before numOfPlayersVoting");
      numOfPlayersVoting = await postVote(selectedCaption, userData);


      console.log("after numOfPlayersVoting:");
      if (numOfPlayersVoting === 0 || selectedCaptionIndex == -1) {

        let publishTimer = 0;
          
        if(numOfPlayersVoting != 0)  publishTimer = 5000;

        function timeout() {

        setTimeout(async () => {
  
          console.log("before publish start scoreboard after numofplayersVoting");
        await publishWithPopup({data:{ message: "Start ScoreBoard", roundNumber: userData.roundNumber } });
      } , publishTimer); // 5000 milliseconds = 5 seconds

    }
    
    console.log("here line 436 numOfPlayersVoting : ",numOfPlayersVoting )
  if(userData.host || numOfPlayersVoting === 0 || selectedCaptionIndex === -1) timeout();
}


    } catch (error) {
      handleApiError(error, voteButton, context);
    }
  }

  function getBackgroundColor(status) {
    return backgroundColors[status];
  }

  return (
    <div>       { loadSpinner && <LoadingScreen />}
    <div
      style={{
        background: "#878787",
        width: "100%",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "scroll",
      }}
    >
      <Container fluid>
        {/* Popup Modal */}
        <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>{popupMessage}</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={() => setShowPopup(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
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
                //position: "absolute",
                top: 32,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "2rem",
              }}
            >
              <img
                className="imgVote"
                src={userData.imageURL}
                style={{
                  width: "96%",
                  height: "96%",
                  borderRadius: "0px",
                  objectFit: "contain",
                }}
              />
            </div>
          </Col>
        </Row>

        <Form>
          <Row className="text-center">
            <Col>
              {voteSubmitted && (
                <div
                  className="submittedVote"
                  style={{
                    fontFamily: "Grandstander",
                    fontSize: "25px",
                    fontWeight: "600",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <br />
                  <b>Vote submitted.</b>
                  <br />
                  Waiting for other players to submit votes...
                  <br />
                  <ReactBootStrap.Spinner animation="border" role="status" />
                </div>
              )}
            </Col>
          </Row>
          <Row
            className="text-center"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Col>
              <div
                style={{
                  width: 76,
                  height: 76,
                  background: "#ADC3EC",
                  borderRadius: "50%",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "700",
                  wordWrap: "break-word",
                  //marginBottom: "10rem",
                  marginTop: "2rem",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <CountdownCircleTimer
                  size={76}
                  strokeWidth={5}
                  isPlaying
                  
                  // duration={timeRemaining}
                  duration={userData.roundTime}
                  colors="#000000"
                  backgroundColors="#ADC3EC"
                  onComplete={() => {
                    // if (!voteSubmitted) {
                      // wrong value being sent, it should be -1
                      // voteButton(true);
                      voteButton(-1)
                    // }
                  }}
                >
                  {({ remainingTime }) => {
                   setRemainingTime(remainingTime);

                    return <div className="countdownVote">{remainingTime}</div>;
                  }}
                </CountdownCircleTimer>
              </div>
            </Col>
          </Row>
          {!voteSubmitted && (
            <Row>
              <Col>
                {shuffledCaptions.map((caption, index) => {
                  let status = "";
                  if (caption === isMyCaption) status = "myCaption";
                  else if (toggles[index] === true) status = "selected";
                  else status = "default";
                  return (
                    // <Row className="text-center">
                    <Button
                      onClick={(event) => updateToggles(index)}
                      style={{
                        width: "357px",
                        // height: 54,
                        background: getBackgroundColor(status),
                        borderRadius: 30,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 35,
                        fontFamily: "Grandstander",
                        fontWeight: "600",
                        wordWrap: "break-word",
                        //marginLeft: "2.5rem",
                        marginTop: "4rem",
                        marginLeft: "auto",
                        marginRight: "auto",
                      }}
                    >
                      {caption}
                    </Button>
                    // </Row>
                  );
                })}
              </Col>
            </Row>
          )}
        </Form>
        <Row className="text-center">
          <Col style={{ position: "relative" }}>
            <div style={{ marginLeft: "-110px" }}>
              <PolygonWhiteUpward />
            </div>
            <input
              type="text"
              style={{
                width: "350px",
                height: 56,
                background: "#FFF",
                borderRadius: 30,
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 6,
                paddingBottom: 6,
                color: "black",
                fontSize: 30,
                fontFamily: "Grandstander",
                fontWeight: "700",
                wordWrap: "break-word",
                marginTop: "-1px",
                border: "none",
                outline: "none",
                textAlign: "center",
                marginRight: "auto",
                marginLeft: "auto",
              }}
              value={userData.deckTitle}
              readOnly
            />
          </Col>
        </Row>
      </Container>
    </div>
    </div>
 
  );
};
export default VoteImage;
