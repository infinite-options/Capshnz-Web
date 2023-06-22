import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCookies } from 'react-cookie'
import useAbly from "../util/ably";
import { joinGame, getGameScore, summary } from "../util/Api"
import "../styles/EndGame.css"
import { Container, Row, Col, Spinner } from "react-bootstrap"
import { handleApiError } from "../util/ApiHelper"
import { ErrorContext } from "../App"

export default function EndGame(){
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [scoreBoard, setScoreBoard] = useState([])
    const [captions, setCaptions] = useState([])
    const [loadingImg, setloadingImg] = useState(false)
    const { publish, subscribe, unSubscribe } = useAbly(userData.gameCode)
    const [isLoading, setLoading] = useState(false)
    const [isHostStartingAgain, setHostStartingAgain] = useState(false)
    const context = useContext(ErrorContext)

    async function startGameButton() {
        try {
            setLoading(true)
            const updatedUserData = {
                ...userData,
                roundNumber: 1,
                playAgain: true,
            };
            await publish({data: { message: "Play Again" }})
            navigate("/ScoreType", { state: updatedUserData })
        } catch (error) {
            handleApiError(error, startGameButton, context)
        } finally {
            setLoading(false)
        }
    }

    const subscribePlayAgain = async () => {
        await subscribe(async (event) => {
            if (event.data.message === "Play Again") {
                setHostStartingAgain(true)
            } else if (event.data.message === "Start Again") {
                const updatedUserData = {
                    ...userData,
                    gameCode: event.data.gameCode,
                    roundNumber: 1,
                    host: false,
                };
                await joinGame(updatedUserData)
                navigate("/Waiting", { state: updatedUserData })
            }
        })
    }

    const fetchSummary = async () => {
        const response = await summary(userData.gameUID)
        setCaptions(response.data.captions)
    }

    useEffect(() => {
        subscribePlayAgain()
        fetchSummary()
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
            {isHostStartingAgain && (
                <div className="d-flex justify-content-center mb-5">
                    <Spinner animation="border" role="status" />
                    <span>&nbsp;&nbsp;{"Starting again..."}</span>
                </div>
            )}
            <button className="buttonRoundType" onClick={landingButton} style={{marginBottom: "20px"}}>
                Return to Landing Page
            </button>
            <Container style={{backgroundImage: "none"}}>
                <Row key="heading" className="text-center py-1">
                    <Col><h3>{"Winning captions"}</h3></Col>
                </Row>
                {captions.map((caption, index) => {
                    return(
                        <>
                            <Row key={index} className="text-center py-1">
                                <Col>{`Round: ${caption.round_number}`}</Col>
                            </Row>
                            <Row key={index} className="text-center py-1">
                                <Col><img className="imgCaption" src={caption.round_image_uid} alt="Loading Image...."/></Col>
                            </Row>
                            <Row key={index} className="text-center py-1">
                                <Col>
                                    <button
                                        className="caption"
                                    >
                                        {caption.caption}
                                    </button>
                                </Col>
                            </Row>
                        </>
                    )})
                }
            </Container>
        </div>
    )
}
