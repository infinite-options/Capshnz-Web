import { useState, useContext,useEffect, } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { useCookies } from 'react-cookie'
import { joinGame, getGameScore, summary, summaryEmail } from "../util/Api"
import useAbly from "../util/ably";
import {ReactComponent as Polygon} from "../assets/Polygon 1.svg";
import { Col, Container, Row,} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";


const FinalScore = () => {
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [scoreBoard, setScoreBoard] = useState([])
    const [captions, setCaptions] = useState([])
    const [loadingImg, setloadingImg] = useState(false)
    const { publish, subscribe, unSubscribe } = useAbly(userData.gameCode)
    const [isLoading, setLoading] = useState(false)
    const [isSending, setSending] = useState(false)
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
            navigate("/ChooseScoring", { state: updatedUserData })
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
                navigate("/WaitingRoom", { state: updatedUserData })
            }
        })
    }

    const fetchSummary = async () => {
        const response = await summary(userData.gameUID)
        setCaptions(response.data.captions)
    }

    const sendEmail = async () => {
        try {
            setSending(true)
            summaryEmail(userData)
        } catch (error) {
            handleApiError(error, sendEmail, context)
        } finally {
            setSending(false)
        }
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


    return ( 
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: "100%",
                minHeight: "100vh",
                background: '#E58D80',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
            <Container fluid>
                <Row className="text-center" >
                    <Col style={{ position: "relative" }}>
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
                                marginRight:"auto",
                                marginLeft: "auto",
                            }}
                            value="Game Over!" 
                            readOnly 
                        />
                        <div style={{marginTop:'-10px', marginLeft:'120px'}}>
                        <Polygon/>
                        </div>
                        
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"16px",}}>
                    <Col style={{ position: "relative" , marginLeft:"48px"}}>
                        <Polygon style={{ position: "absolute", bottom: "-40px", right: "80px",}}/>
                        <input
                            type="text"
                            style={{
                                width: 300,
                                height: 41,
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
                                marginTop: "32px",
                                border: "none", 
                                outline: "none", 
                                textAlign: "center",
                                marginRight:"auto",
                                marginLeft: "auto",
                            }}
                            value="Final Scores" 
                            readOnly 
                        />
                    </Col>
                </Row>
                {loadingImg &&
                 <div>
                 <img src="/Loading_icon.gif" alt="loading CNN images"  width="250"  className="loadingimg"/>
                 </div>
                }
                <div
                style={{
                    width: '360px',
                    padding: '20px',
                    borderRadius: '40px',
                    background: '#46C3A6',
                    color: '#FFF',
                    fontSize: '26px',
                    fontFamily: 'Grandstander',
                    marginTop: '64px',
                    marginLeft: 'auto',  
                    marginRight: 'auto', 
                }}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{marginLeft:"64px"}}>Alias</div>
                    <div style={{marginRight:"64px"}}>Total</div>
                </div>
                {scoreBoard.map((player, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{marginLeft:"64px"}}>{player.user_alias}</div>
                    <div style={{marginRight:"64px"}}> {player.game_score}</div>
                    </div>
                ))}
                </div>
                <Row className="text-center" style={{marginTop:"80px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                    {userData.host &&
                        <Button 
                            variant="warning" 
                            onClick={startGameButton}
                            disabled={isLoading}
                            style={{
                                width: 350,
                                height: 55,
                                background: "#DCE56F",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                fontSize: 30,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        {isLoading?"Starting...":"Play again"}
                        </Button>
                    }
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"32px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                        <Button variant="warning" onClick={landingButton}
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
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        Return to Home
                        </Button>
                    </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"64px",}}>
                    <Col style={{ position: "relative" ,}}>
                        <Polygon style={{ position: "absolute", bottom: "-40px", right: "80px",}}/>
                        <input
                            type="text"
                            style={{
                                width: 350,
                                height: 55,
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
                                marginTop: "32px",
                                border: "none", 
                                outline: "none", 
                                textAlign: "center",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                            value="Winning Captions" 
                            readOnly 
                        />
                    </Col>
                </Row>
                {captions.map((caption, index) => {
                    return(
                        <div key={index} style={{marginTop:"64px"}}>
                            {"round_image_uid" in caption && (
                                <Row className="text-center py-1">
                                    <Col><img className="imgCaption" src={caption.round_image_uid} alt="Loading Image...."/></Col>
                                </Row>
                            )}
                            {"round_number" in caption && (
                                <Row className="text-center py-3" style={{marginLeft:"auto", marginRight:"auto", marginTop:"0px",width: 136, height: 31, color: '#FFF', fontSize: 25, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                                    <Col>{`Round: ${caption.round_number}`}</Col>
                                </Row>
                            )}
                            <Row className="text-center py-1">
                                <Col>
                                    <Button variant="warning"
                                        style={{
                                            width: 350,
                                            height: 55,
                                            background: "#F5F5F5",
                                            borderRadius: 30,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            color: "#000",
                                            fontSize: 30,
                                            fontFamily: "Grandstander",
                                            fontWeight: "600",
                                            wordWrap: "break-word",
                                            marginLeft: 'auto',  
                                            marginRight: 'auto', 
                                            marginTop: '16px',
                                        }}
                                    >
                                    {caption.caption}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )})
                }
                <Row className="text-center" style={{marginTop:"40px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                    {userData.host &&
                        <Button variant="warning" onClick={sendEmail}
                            disabled={isSending}
                            style={{
                                width: 350,
                                height: 55,
                                background: "#71CAA3",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                fontSize: 30,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                                marginLeft: 'auto',  
                                marginRight: 'auto', 
                            }}
                        >
                        {isSending?"Sending...":"Send Email"}
                        </Button>
                    }
                    </Col>
                </Row>
            </Container>
            </div>
        </div>
    );
}
 
export default FinalScore;