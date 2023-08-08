import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCookies } from 'react-cookie'
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 4.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";

const ChooseScoring = () => {
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [scoreType, setScoreType] = useState("")

    function continueButton(){
        if (scoreType === ""){
            alert("Please select a scoring system.")
            return
        }
        const updatedUserData = {
            ...userData,
            scoreType: scoreType
        }
        // navigate("/RoundType", { state: updatedUserData })
        navigate("/ChooseRounds", { state: updatedUserData })
    }
    return ( 
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%', 
                height: '100vh', 
                background: 'rgba(183, 214, 225, 1)'}}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
            <Container style={{ paddingTop: "60px",}} fluid>
                <Row className="text-center py-3" style={{width: 390, color: 'white', fontSize: 30, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                <Col>Choose a scoring system</Col>
                </Row>
                <Row className="text-center" style={{marginTop:"32px"}}>
                <Col style={{ position: "relative", }}>
                    <Button 
                        variant="warning" 
                        onClick={() => setScoreType("V")}
                        style={{
                            width: 330,
                            height: 55,
                            background: "rgba(237, 70, 70, 0.59)",
                            borderRadius: 30,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 30,
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                            marginLeft: "32px",
                            marginTop: "-2px",
                        }}
                    >
                    Score by Votes
                    </Button>
                    <Polygon style={{marginLeft:"200px", marginTop:"-2px"}}/>
                </Col>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"0px", marginTop:"32px",width: 375, color: 'white', fontSize: 22, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> player receives 2 points per vote</Col>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"8px", marginTop:"32px",width: 370, color: 'black', fontSize: 30, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> OR </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"32px"}}>
                    <Col style={{ position: "relative" }}>
                        <Polygon style={{ position: "absolute", bottom: "-30px", left: "80px" }}/>
                        <Button 
                            variant="warning" 
                            onClick={() => setScoreType("R")}
                            style={{
                                width: 330,
                                height: 55,
                                background: "rgba(237, 70, 70, 0.59)",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                fontSize: 30,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                                marginLeft: "32px",
                                marginTop: "-2px",
                            }}
                        >
                        Score by Ranking
                        </Button>
                    </Col>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"0px", marginTop:"32px",width: 375, height: 73, color: 'white', fontSize: 22, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> player(or players) with the most    votes = 5 points, 2nd place gets 3 points  </Col>
                </Row>
                <Row className="text-center" style={{marginTop:"80px", marginLeft:"0px"}}>
                    <Col style={{ position: "relative" }}>
                        <Button variant="warning" onClick={continueButton}
                            style={{
                                width: 350,
                                height: 55,
                                background: "rgba(70, 195, 166, 0.65)",
                                borderRadius: 30,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "white",
                                fontSize: 35,
                                fontFamily: "Grandstander",
                                fontWeight: "600",
                                wordWrap: "break-word",
                            }}
                        >
                        Continue
                        </Button>
                    </Col>
                </Row>
            </Container>
            </div>
        </div>
    );
}
 
export default ChooseScoring;