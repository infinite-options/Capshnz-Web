import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import { ReactComponent as Polygon } from "../assets/Polygon 3.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";
import Spinner from "react-bootstrap/Spinner";
import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import { getCurrentRound } from "../util/Api";

const MidGameWaitingRoom = () => {
  console.log("In MidGameWaitingRoom");
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  // const { publish, subscribe, unSubscribe, detach } = useAbly(
  //     `${userData.gameCode}/${userData.roundNumber}`
  //   );
  const { publish, subscribe, unSubscribe, detach } = useAbly(userData.gameCode);

  // console.log("here 26 midgamewaitingroom", userData)
  const [cookies, setCookie] = useCookies(["userData"]);

  useEffect(() => {
    // fetch current round
    // console.log("here is use effect for getting current round details")
    async function getCurrentStatus() {
      const currentGameStatus = await getCurrentRound(userData.gameUID);

      // renderCurrentGameData(currentGameStatus.data.captions);
      // console.log("here in middleware after current round fetch and userData", currentGameStatus, userData);
      // setUserData(prevUserData => ({
      //   ...prevUserData,
      //   roundNumber : currentGameStatus.roundNumber
      // }))
    }
    // getCurrentStatus()
  }, []);
  useEffect(() => {
    // console.log("here 15 before subscribe")
    subscribe((event) => {
      // console.log("iside midd game subscribe --> document hidden ?", document.hidden)
      if (!document.hidden) {
        console.log("here event.data.roundNumber", event.data);

        setUserData({
          ...userData,
          roundNumber: event.data.roundNumber,
          imageURL: event.data.imageURL,
        });
        const currentState = {
          ...userData,
          roundNumber: event.data.roundNumber,
          midGameTimeStamp: event.timestamp,
          imageURL: event.data.imageURL, // Assuming midGameTimeStamp is a field in the event variable
        };
        if (event.data.message === "Start Vote") {
          navigate("/VoteImage", { state: currentState });
        } else if (event.data.message === "Start ScoreBoard") {
          setCookie("userData", userData, { path: "/" });
          navigate("/ScoreBoardNew", { state: userData });
        } else if (event.data.message === "Start Next Round") {
          const updatedUserData = {
            ...userData,
            roundNumber: event.data.roundNumber,
            imageURL: event.data.imageURL,
            midGameTimeStamp: event.timestamp,
          };
          setCookie("userData", updatedUserData, { path: "/" });
          navigate("/CaptionNew", { state: updatedUserData });
        } else if (event.data.message === "Start EndGame") {
          navigate("/FinalScore", { state: userData });
        } else if (event.data.message === "Start Caption") {
          console.log("Navigating to CaptionNew from MidGameWaitingRoom - starting caption phase");
          navigate("/CaptionNew", { state: userData });
        }
      }
    });
  });

  function renderCurrentGameData(overallGameData) {
    let currentRoundObject = {};
    for (let i = 0; i < overallGameData.length; i++) {
      console.log("here , i", i, overallGameData[i]["captions_submitted"], overallGameData[i]["votes_submitted"]);
      if (overallGameData[i]["captions_submitted"] == 0 && overallGameData[i]["votes_submitted"] == 0) {
        currentRoundObject = overallGameData[i - 1];
      }
      setUserData((prevUserData) => ({
        ...prevUserData,
        roundNumber: currentRoundObject["round_number"],
      }));
    }

    console.log("here 98 in renderCurrentgamedata overallgamedata , currentRoundObject", overallGameData, currentRoundObject);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // This ensures the container takes the full height of the viewport
        backgroundColor: "#E58D80",
      }}
    >
      <Spinner animation='grow' variant='primary' />
      <span style={{ marginTop: "10px" }}>Wait while we add you back to the game</span>
    </div>
  );
};

export default MidGameWaitingRoom;

// <>
//   {/* <Button variant="primary" onClick={handleShow}>
//     Launch demo modal
//   </Button> */}
//     <Spinner animation="grow" />

//     <span >Wait while we add you back to the game  </span>

// </>
