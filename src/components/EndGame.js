import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCookies } from 'react-cookie'
import useAbly from "../util/ably";
import { postCreateRounds, getGameScore } from "../util/Api"
import "../styles/EndGame.css"
import { Container, Row, Col } from "react-bootstrap"
import { handleApiError } from "../util/ApiHelper"
import { ErrorContext } from "../App"

export default function EndGame(){
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [scoreBoard, setScoreBoard] = useState([])
    const [loadingImg, setloadingImg] = useState(false)
    const { publish, subscribe, unSubscribe } = useAbly(userData.gameCode)
    const [isLoading, setLoading] = useState(false)
    const context = useContext(ErrorContext)

    async function startGameButton() {
        try {
            setLoading(true)
            let imageURL = ""
            if(userData.isApi){
                imageURL = await postCreateRounds(userData.gameCode, [], true)
            }
            await publish({data: {
                    message: "Start Again",
                    numOfPlayers: userData.numOfPlayers,
                    isApi: userData.isApi,
                    deckTitle: userData.deckTitle,
                    deckUID: userData.deckUID,
                    gameUID: userData.gameUID,
                    numOfRounds: userData.numOfRounds,
                    roundTime: userData.roundTime,
                    imageURL: imageURL
            }})
        } catch (error) {
            handleApiError(error, startGameButton, context)
        } finally {
            setLoading(false)
        }
    }

    const subscribePlayAgain = async () => {
        await subscribe(async (event) => {
          if (event.data.message === "Start Again") {
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
                roundNumber: 1,
                };
                setUserData(updatedUserData);
                setCookie("userData", updatedUserData, { path: "/" });
                navigate("/Caption", { state: updatedUserData });
            }
        })
    }

    useEffect(() => {
        subscribePlayAgain()
        return () => unSubscribe()
    }, [])

    useEffect(() => {
        async function scoreBoard() {
            setloadingImg(true)
            const scoreboard = await getGameScore(userData.gameCode,userData.numOfRounds)
            setloadingImg(false)
            scoreboard.sort((a, b) => b.game_score - a.game_score)
            setScoreBoard(scoreboard)
        }
        if (cookies.userData === undefined || cookies.userData.scoreBoard === undefined || cookies.userData.scoreBoard.length == 0) {
            scoreBoard()
        } else {
            // console.log(cookies.userData)
            // console.log(cookies.userData.scoreBoard.lenght)
            const scoreboard = cookies.userData.scoreBoard;
            scoreboard.sort((a, b) => b.game_score - a.game_score)
            setScoreBoard(scoreboard)
        }
    }, [userData])
    
    function landingButton(){
        navigate("/", { state: userData })
    }

    return(
        <div className="endgame">
            <div className="headerEndGame">
                <h1>Game Over</h1>
                <br/>
                <h3>Final Scores</h3>
            </div>
            {loadingImg &&
                 <div>
                 <img src="/Loading_icon.gif" alt="loading CNN images"  width="250"  className="loadingimg"/>
                 {/* <br/> <h6> CNN Deck may take more time for loading </h6> */}
                 </div>
                // <img  href="" />

            }
            <Container className="results">
                <Row key="heading" className="text-start py-1">
                    <Col>{"Alias"}</Col>
                    <Col>{"Total"}</Col>
                </Row>
                {scoreBoard.map((player, index) => {
                    return(
                        <Row key={index} className="py-1">
                            <Col>{player.user_alias}</Col>
                            <Col className="text-end score">{player.game_score}</Col>
                        </Row>
                    )})
                }
            </Container>
            <br/>
            {userData.host && userData.deckSelected &&
                <button className="buttonRoundType" onClick={startGameButton} disabled={isLoading} style={{marginBottom: "20px"}}>
                    {isLoading?"Starting...":"Start again"}
                </button>
            }
            <button className="buttonRoundType" onClick={landingButton}>
                Return to Landing Page
            </button>
            <br/>
        </div>
    )
}
