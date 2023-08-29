import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import useAbly from "../util/ably";
import { getApiImages, postCreateRounds } from "../util/Api";
import { ReactComponent as Polygon } from "../assets/Polygon 1.svg";
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";
import { getDecks, selectDeck } from "../util/Api.js";
import "../styles/Landing.css";
import { ReactComponent as CloseButton } from "../assets/close-button.svg";

const WaitingRoom = () => {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  const {
    publish,
    subscribe,
    onMemberUpdate,
    getMembers,
    addMember,
    unSubscribe,
    removeMember,
  } = useAbly(userData.gameCode);
  const [buttonText, setButtonText] = useState("Share with other players");
  const [lobby, setLobby] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const context = useContext(ErrorContext);
  const [decksInfo, setDecksInfo] = useState([]);

  useEffect(() => {
    async function getDecksInfo() {
      const decksInfo = await getDecks(userData.playerUID);
      setDecksInfo(decksInfo);
    }
    getDecksInfo();
  }, [userData.playerUID]);

  function copyGameCodeButton() {
    navigator.clipboard.writeText(userData.gameCode);
    setButtonText("Copied!");
    setTimeout(() => {
      setButtonText("Share with other players");
    }, 4000);
  }

  function selectDeckButton() {
    navigate("/SelectDeck", { state: userData });
    // navigate("/SelectingDeck", { state: userData })
  }

  async function startGameButton() {
    try {
      setLoading(true);
      let imageURL = "";
      if (userData.isApi) {
        const imageURLs = await getApiImages(userData);
        imageURL = await postCreateRounds(userData.gameCode, imageURLs, {
          timeout: 60000,
        });
      }
      await publish({
        data: {
          message: "Start Game",
          numOfPlayers: lobby.length,
          isApi: userData.isApi,
          deckTitle: userData.deckTitle,
          deckUID: userData.deckUID,
          gameUID: userData.gameUID,
          numOfRounds: userData.numOfRounds,
          roundTime: userData.roundTime,
          imageURL: imageURL,
        },
        timeout: 60000,
      });
    } catch (error) {
      console.log(error);
      handleApiError(error, startGameButton, context);
    } finally {
      setLoading(false);
    }
  }

  const destroyLobby = async () => {
    unSubscribe();
    removeMember(userData.playerUID);
  };

  const refreshLobby = async () => {
    const members = await getMembers();
    setLobby(members.map((member) => member.data));
  };

  const initializeLobby = async () => {
    await onMemberUpdate(refreshLobby);
    await addMember(userData.playerUID, { alias: userData.alias });
    await subscribe(async (event) => {
      if (event.data.message === "Start Game") {
        const updatedUserData = {
          ...userData,
          numOfPlayers: event.data.numOfPlayers,
          isApi: event.data.isApi,
          deckTitle: event.data.deckTitle,
          deckUID: event.data.deckUID,
          gameUID: event.data.gameUID,
          numOfRounds: event.data.numOfRounds,
          roundTime: event.data.roundTime,
          imageURL: event.data.imageURL,
        };
        setUserData(updatedUserData);
        setCookie("userData", updatedUserData, { path: "/" });
        navigate("/CaptionNew", { state: updatedUserData });
      }
    });
  };

  useEffect(() => {
    initializeLobby();
    return () => destroyLobby();
  }, []);

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100vh",
        background: "#CBDFBD",
        overflow: "scroll",
        paddingBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
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
            <Col style={{ position: "relative", width: 370 }}>
              <Polygon
                style={{ position: "absolute", bottom: "-32px", right: "60px" }}
              />
              <input
                type="text"
                style={{
                  width: 350,
                  height: 60,
                  background: "#FFF",
                  borderRadius: 30,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 6,
                  paddingBottom: 6,
                  color: "black",
                  fontSize: 24,
                  fontFamily: "Grandstander",
                  fontWeight: "700",
                  wordWrap: "break-word",
                  marginLeft: "0px",
                  marginTop: "32px",
                  border: "none",
                  outline: "none",
                }}
                value="Waiting for all Players . . ."
                readOnly
              />
            </Col>
          </Row>
        </Container>
      </div>
      <ul className="lobbyWaiting" style={{ marginTop: "64px" }}>
        {lobby.map((player, index) => {
          return (
            <li key={index} className="lobbyPlayerWaiting">
              <div style={{ display: "flex", alignItems: "center" }}>
                <i
                  className="fas fa-circle fa-3x"
                  style={{ color: "#8D3B9B" }}
                />
                <div
                  style={{
                    marginLeft: "10px",
                    color: "white",
                    fontSize: 25,
                    fontFamily: "Grandstander",
                    fontWeight: "700",
                    wordWrap: "break-word",
                  }}
                >
                  {player.alias}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          style={{
            // display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {userData.host && userData.deckSelected && (
            <div
              onClick={(event) => selectDeckButton()}
              className="deck"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                marginRight: "40px",
                marginBottom: "0px",
              }}
            >
              <div style={{ cursor: "pointer" }}>
                <img
                  src={
                    userData.deckTitle === "Google Photos"
                      ? "https://upload.wikimedia.org/wikipedia/commons/f/fb/Google-Photos_icon_logo_%28May-September_2015%29.png"
                      : userData.deckThumbnail_url
                  }
                  alt={userData.deckTitle}
                  className="deck-image"
                />
                <div className="deckText">{userData.deckTitle}</div>
              </div>
              <br />
            </div>
          )}

          <input
            type="text"
            style={{
              width: 330,
              height: 55,
              background: "#DC816A",
              borderRadius: 40,
              paddingLeft: 24,
              paddingRight: 24,
              paddingTop: 6,
              paddingBottom: 6,
              color: "#FFF",
              fontSize: 24,
              fontFamily: "Grandstander",
              fontWeight: "700",
              wordWrap: "break-word",
              border: "none",
              outline: "none",
              textAlign: "center",
            }}
            value={`Game Code: ${userData.gameCode}`}
            readOnly
          />
          <Button
            variant="warning"
            onClick={copyGameCodeButton}
            style={{
              width: 330,
              minHeight: 55,
              background: "#DC816A",
              borderRadius: 40,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              fontSize: 24,
              fontFamily: "Grandstander",
              fontWeight: "700",
              wordWrap: "break-word",
              marginTop: "10px",
            }}
          >
            {buttonText}
          </Button>
          {userData.host && !userData.deckSelected && (
            <Button
              variant="warning"
              onClick={selectDeckButton}
              style={{
                width: 330,
                height: 55,
                background: "#DC816A",
                borderRadius: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 24,
                fontFamily: "Grandstander",
                fontWeight: "700",
                wordWrap: "break-word",
                marginTop: "10px",
              }}
            >
              Select Deck
            </Button>
          )}
          {userData.host && userData.deckSelected && (
            <Button
              variant="warning"
              onClick={startGameButton}
              disabled={isLoading}
              style={{
                width: 330,
                height: 55,
                background: "#71CAA3",
                borderRadius: 40,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: 24,
                fontFamily: "Grandstander",
                fontWeight: "700",
                wordWrap: "break-word",
                marginTop: "10px",
              }}
            >
              {isLoading ? "Starting..." : `Start Game`}
            </Button>
          )}
        </Container>
      </div>
    </div>
  );
};

export default WaitingRoom;
