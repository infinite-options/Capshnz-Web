import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import { submitCaption, sendError, getScoreBoard, getSubmittedCaptions, getGameImageForRound } from "../util/Api";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import * as ReactBootStrap from "react-bootstrap";
import "../styles/Caption.css";
import { ErrorContext } from "../App";
import { handleApiError } from "../util/ApiHelper";

export default function Caption() {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const { publish, subscribe, unSubscribe, detach } = useAbly(`${userData.gameCode}/${userData.roundNumber}`);
  const [caption, setCaption] = useState("");
  const [captionSubmitted, setCaptionSubmitted] = useState(false);
  const isCaptionDisplayed = useRef(false);
  const context = useContext(ErrorContext);
  const imageRef = useRef(null);

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
    let mounted = true;
    let interval = null;

    async function getCaptionsForUser() {
      try {
        const image_URL = await getGameImageForRound(userData.gameCode, userData.roundNumber);
        if (!mounted) return;

        if (image_URL !== userData.imageURL) {
          sendingError();
          const updatedUserData = {
            ...userData,
            imageURL: image_URL,
          };
          setUserData(updatedUserData);
          setCookie("userData", updatedUserData, { path: "/" });
        }
      } catch (error) {
        console.error("Error getting captions:", error);
      }
    }

    if (!isCaptionDisplayed.current && cookies.userData.imageURL !== userData.imageURL) {
      interval = setInterval(() => {
        getCaptionsForUser();
        isCaptionDisplayed.current = true;
      }, 5000);
    }

    return () => {
      mounted = false;
      if (interval) {
        clearInterval(interval);
      }
      unSubscribe();
    };
  }, [userData.roundNumber]); // Only re-run when round number changes
  async function scoreBoard() {
    const scoreboard = await getScoreBoard(userData);
    scoreboard.sort((a, b) => b.game_score - a.game_score);
    return scoreboard;
  }
  function handleChange(event) {
    setCaption(event.target.value);
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
    const subscription = subscribe((event) => {
      if (event.data.message === "Start Vote") {
        navigate("/Vote", { state: userData });
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
        navigate("/EndGame", { state: updatedUserData });
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userData.roundNumber]); // Only re-run when round number changes

  useEffect(() => {
    const currentImage = imageRef.current;

    return () => {
      if (currentImage) {
        currentImage.src = "";
        // Create a new blank image to force garbage collection
        const img = new Image();
        img.src = currentImage.src;
      }
    };
  }, [userData.roundNumber]);

  return (
    <div className='caption'>
      {userData.host && (
        <Link
          onClick={() => {
            window.confirm("Are you sure you want to end this game?") && closeButton();
          }}
          className='closeBtn'
        >
          <i className='fa'>&#xf00d;</i>
        </Link>
      )}
      <h1 className='titleCaption'>{userData.deckTitle}</h1>
      <h3 className='roundCaption'>
        Round: {userData.roundNumber}/{userData.numOfRounds}
      </h3>
      <br />
      <img ref={imageRef} className='imgCaption' src={userData.imageURL} alt='Loading Image....' />
      {/* <p style={{textAlign:"center", overflow:"hidden"}}>ImageURL: {userData.imageURL}</p> */}
      <br />
      {!captionSubmitted && <input className='inputCaption' onChange={handleChange} type='text' placeholder='Enter your caption here' />}
      <div className='containerCaption'>
        <CountdownCircleTimer
          size={60}
          strokeWidth={5}
          isPlaying
          duration={userData.roundTime}
          colors='#000000'
          onComplete={() => {
            if (!captionSubmitted) {
              submitButton(true);
            }
          }}
        >
          {({ remainingTime }) => {
            return <div className='countdownCaption'>{remainingTime}</div>;
          }}
        </CountdownCircleTimer>
      </div>
      {!captionSubmitted && (
        <button className='submitCaption' onClick={(event) => submitButton(false)}>
          Submit
        </button>
      )}
      {captionSubmitted && (
        <div className='submittedCaption'>
          <button className='submitCaption'>Submitted</button>
          <br />
          Waiting for other players to submit captions...
          <br />
          <ReactBootStrap.Spinner animation='border' role='status' />
        </div>
      )}
      <br />
      <br />
    </div>
  );
}
