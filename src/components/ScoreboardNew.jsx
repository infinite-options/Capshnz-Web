import { Container, Row, Col, Button } from "react-bootstrap";
import { ReactComponent as Polygon } from "../assets/Polygon 1.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as PolygonWhiteUpward } from "../assets/polygon-upward-white.svg";
import { ReactComponent as PolygonYelloUpward } from "../assets/polygon-upward-yellow.svg";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { useState, useEffect, useRef, useContext } from "react";
import { useCookies } from "react-cookie";
import useAbly from "../util/ably";
import { getScoreBoard, getNextImage, getGameScore } from "../util/Api";

const ScoreboardNew = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const { publish, subscribe, unSubscribe, detach } = useAbly(
    `${userData.gameCode}/${userData.roundNumber}`
  );
  const [scoreBoard, setScoreBoard] = useState([]);
  const isGameEnded = useRef(false);
  const [isScoreBoard, setisScoreBoard] = useState(false);
  const isScoreBoardDisplayed = useRef(false);
  const [loadingImg, setloadingImg] = useState(true);
  const context = useContext(ErrorContext);

  if (scoreBoard.length === 0 && cookies.userData.scoreBoard != undefined) {
    setloadingImg(false);
    setScoreBoard(cookies.userData.scoreBoard);
  }

  useEffect(() => {
    if (
      !isScoreBoard &&
      userData.host &&
      cookies.userData.scoreBoard === undefined
    ) {
      async function setScoreBoard() {
        const scoreBoard = await getScoreBoard(userData);
        setloadingImg(false);
        scoreBoard.sort((a, b) => b.votes - a.votes);
        // console.log(scoreBoard)
        setisScoreBoard(true);
        publish({
          data: {
            message: "Set ScoreBoard",
            scoreBoard: scoreBoard,
          },
        });
      }
      setScoreBoard();
    }
  }, [userData, isScoreBoard]);

  useEffect(() => {
    const interval = setInterval(() => {
      // console.log("score interval")
      if (!isScoreBoardDisplayed.current && scoreBoard.length == 0) {
        async function getScoreBoard() {
          const scoreboard = await getGameScore(
            userData.gameCode,
            userData.roundNumber
          );
          setloadingImg(false);
          scoreboard.sort((a, b) => b.game_score - a.game_score);
          setScoreBoard(scoreboard);
          return scoreBoard;
        }
        // console.log("score from service")
        getScoreBoard();
        isScoreBoardDisplayed.current = true;
      }
    }, 5000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [scoreBoard]);
  async function closeButton() {
    await publish({
      data: {
        message: "EndGame scoreboard",
      },
    });
  }
  async function nextRoundButton() {
    try {
      const nextRound = userData.roundNumber + 1;
      const imageURL = await getNextImage(userData.gameCode, nextRound);
      await publish({
        data: {
          message: "Start Next Round",
          roundNumber: nextRound,
          imageURL: imageURL,
        },
      });
    } catch (error) {
      handleApiError(error, nextRoundButton, context);
    }
  }

  async function finalScoresButton() {
    await publish({ data: { message: "Start EndGame" } });
  }

  useEffect(() => {
    subscribe(async (event) => {
      if (event.data.message === "Set ScoreBoard") {
        const updatedUserData = {
          ...userData,
          scoreBoard: event.data.scoreBoard,
        };
        const updatedEndUserData = {
          ...userData,
          scoreBoardEnd: event.data.scoreBoard,
        };
        setloadingImg(false);
        setUserData(updatedEndUserData);
        setCookie("userData", updatedUserData, { path: "/" });
        setScoreBoard(event.data.scoreBoard);
      } else if (event.data.message === "Start Next Round") {
        const updatedUserData = {
          ...userData,
          roundNumber: event.data.roundNumber,
          imageURL: event.data.imageURL,
        };
        setUserData(updatedUserData);
        setCookie("userData", updatedUserData, { path: "/" });
        navigate("/CaptionNew", { state: updatedUserData });
      } else if (event.data.message === "Start EndGame") {
        navigate("/FinalScore", { state: userData });
      }
    });
    return () => unSubscribe();
  }, []);

  useEffect(() => {
    subscribe(async (event) => {
      if (event.data.message === "EndGame scoreboard") {
        detach();
        const updatedUserData = {
          ...userData,
          scoreBoard: scoreBoard,
        };
        setCookie("userData", updatedUserData, { path: "/" });
        if (!userData.host && !isGameEnded.current) {
          isGameEnded.current = true;
          alert("Host has Ended the game");
        }
        navigate("/FinalScore", { state: updatedUserData });
      }
    });
  }, [scoreBoard]);

  return (
    <div
      style={{
        //display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        background: "#E58D80",
        overflow: "scroll",
      }}
    >
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "100%",
          overflowY: "scroll",
          maxHeight: "100vh",
        }}
      > */}
      <Container>
        <Row className="text-center">
          <Col style={{}}>
            <input
              type="text"
              style={{
                width: 350,
                height: 64,
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
                marginTop: "8px",
                border: "none",
                outline: "none",
                textAlign: "center",
                marginRight: "auto",
                marginLeft: "auto",
              }}
              value="Scoreboard!"
              readOnly
            />
            <div style={{ marginTop: "-10px", marginLeft: "120px" }}>
              <Polygon />
            </div>
          </Col>
        </Row>
        <Row className="text-center">
          <div
            style={{
              width: "374px",
              height: "365px",
              padding: "20px",
              borderRadius: "40px",
              background: "#D9D9D9",
              color: "#FFF",
              fontSize: "26px",
              fontFamily: "Grandstander",
              marginTop: "64px",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "2rem",
            }}
          >
            <img className="imgVote" src={userData.imageURL} />
          </div>
        </Row>
        <Row className="text-center">
          <div style={{ marginLeft: "-110px", marginBottom: "-8px" }}>
            <PolygonYelloUpward />
          </div>
          <div
            style={{
              width: "400px",
              height: "223px",
              padding: "20px",
              borderRadius: "40px",
              background: "#F2BF7D",
              color: "#FFF",
              fontSize: "26px",
              fontFamily: "Grandstander",
              //marginTop: "64px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {" "}
            <div className="headerScoreBoard">
              <div>Alias</div>
              <div>Votes</div>
              <div>Points</div>
              <div>Total</div>
            </div>
            {scoreBoard.map((player, index) => {
              return (
                <div key={index}>
                  <div className="valuesScoreBoard">
                    <div>{player.user_alias}</div>
                    <div>{player.votes}</div>
                    <div>{player.score}</div>
                    <div>{player.game_score}</div>
                  </div>
                  {player.caption !== "" && <div>{player.caption}</div>}
                  {player.caption === "" && <div>&nbsp;</div>}
                </div>
              );
            })}
          </div>
        </Row>
        <Row
          className="text-center"
          style={{ marginTop: "32px", marginLeft: "0px" }}
        >
          <Col style={{ position: "relative" }}>
            {userData.host && userData.roundNumber !== userData.numOfRounds && (
              <Button
                variant="warning"
                onClick={nextRoundButton}
                style={{
                  width: 350,
                  height: 55,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "2rem",
                }}
              >
                Next Round
              </Button>
            )}
            {userData.host && userData.roundNumber === userData.numOfRounds && (
              <Button
                variant="warning"
                onClick={finalScoresButton}
                style={{
                  width: 350,
                  height: 55,
                  background: "#5E9E94",
                  borderRadius: 30,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontSize: 30,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "2rem",
                }}
              >
                Final Score
              </Button>
            )}
          </Col>
        </Row>
        <Row className="text-center">
          <Col style={{ position: "relative" }}>
            <div style={{ marginLeft: "-110px" }}>
              <PolygonWhiteUpward />
            </div>
            <input
              type="text"
              style={{
                width: "405px",
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
      {/* </div> */}
    </div>
  );
};
export default ScoreboardNew;
