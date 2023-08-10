import Form from "react-bootstrap/Form";
import { Col } from "react-bootstrap";
import { useState, useEffect, useRef, useContext } from "react";
import Button from "react-bootstrap/Button";
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 375,
          height: 365,
          background: "#D9D9D9",
          borderRadius: 30,
          position: "absolute",
          top: 32,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //marginBottom: 20,
        }}
      >
        {/* <p
          style={{
            fontFamily: "Grandstander",
            fontSize: 60,
            fontWeight: 500,
            lineHeight: "60px",
            letterSpacing: "0em",
            textAlign: "left",
            margin: 0,
            padding: 20,
          }}
        >
          IMAGE
        </p> */}
        <img
          className="imgCaption"
          src={userData.imageURL}
          alt="Loading Image...."
        />
        <div
          style={{
            width: 76,
            height: 76,
            background: "#566176",
            borderRadius: "50%",
            position: "absolute",
            top: 280,
            left: 290,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 30,
            fontFamily: "Grandstander",
            fontWeight: "700",
            wordWrap: "break-word",
          }}
        >
          <CountdownCircleTimer
            size={60}
            strokeWidth={5}
            top="280"
            left="290"
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
              return <div className="countdownCaption">{remainingTime}</div>;
            }}
          </CountdownCircleTimer>
        </div>
      </div>
      <Form noValidate onSubmit={(event) => submitButton(false)}>
        <Form.Group as={Col} md="10">
          {/* <Form.Label
            style={{
              width: "383px",
              color: "white",
              fontSize: "32px",
              fontFamily: "Grandstander",
              fontWeight: "600",
              wordWrap: "break-word",
            }}
          ></Form.Label> */}
          <Form.Control
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
              marginTop: "160px",
            }}
            //value={email}
            type="text"
            placeholder="Enter caption here..."
            onChange={handleChange}
            disabled={captionSubmitted}
            value={inputCaption}
          />

          <Button
            variant="success"
            //type="submit"
            onClick={(event) => submitButton(false)}
            disabled={captionSubmitted}
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
              marginLeft: "90px",
              marginTop: "100px",
            }}
          >
            Submit
          </Button>
        </Form.Group>
      </Form>
      <div
        style={{
          //paddingTop: "200px",
          bottom: 20,
          left: 0,
          right: 0,
        }}
      >
        <PolygonWhiteUpward style={{ marginLeft: "-163px" }} />

        <div
          style={{
            width: "95%",
            height: 65,
            background: "white",
            borderRadius: 40,
            position: "absolute",
            //top: 805,
            left: 7,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "black",
            fontSize: 37,
            fontFamily: "Grandstander",
            fontWeight: "700",
            wordWrap: "break-word",
          }}
        >
          Selected Gallery
        </div>
      </div>
    </div>
  );
};
export default CaptionNew;
