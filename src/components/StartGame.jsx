import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 3.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";
const StartGame = () => {
    const [gameCode, setGameCode] = useState("");
    const navigate = useNavigate(),
        location = useLocation();
    const userData = location.state;
    const [isCreateLoading, setCreateLoading] = useState(false);
    const [isJoinLoading, setJoinLoading] = useState(false);
    const context = useContext(ErrorContext);

    const handleGameCodeChange = (event) => {
        setGameCode(event.target.value);
      };
    
    const createNewGameButton = async (event) => {
        
    };
    
    const joinGameButton = async (event) => {
        navigate("/ChooseScoring", { state: userData });
    };
    
    const handleFeedback = () => {
        navigate("/Feedback", { state: userData });
    };

    return ( 
        <div
            style={{width: '100%', height: '100vh', background: 'rgba(241, 205, 92, 0.73)'}}
        >
            <Form onSubmit={joinGameButton}>
                <Container fluid>
                <Row className="text-center py-5">
                    <Col>
                    <div
                        style={{
                        width: "374px",
                        height: "29px",
                        color: "white",
                        fontSize: "47px",
                        fontFamily: "Grandstander",
                        fontWeight: "800",
                        wordWrap: "break-word",
                        }}
                    >
                        Welcome Name!
                    </div>
                    </Col>
                </Row>
                <Row style={{marginLeft:"8px"}}>
                    <Form.Group as={Col} md="10" >
                    <Form.Label
                        style={{
                            width: "330px",
                            color: "white",
                            fontSize: "32px",
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                        }}
                    >
                        Enter Game Code
                    </Form.Label>
                    <Form.Control
                        style={{
                            width: 330,
                            height: 50,
                            background: "white",
                            borderRadius: 40,
                            color: "black",
                            fontSize: 23,
                            fontFamily: "Grandstander",
                            fontWeight: "500",
                            wordWrap: "break-word",
                          }}
                        required
                        value={gameCode}
                        type="text"
                        placeholder="Enter game code here..."
                        onChange={handleGameCodeChange}
                        inputMode="numeric"
                    />
                    </Form.Group>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"100px"}}>
                    <Col>
                    <Button
                        variant="success"
                        type="submit"
                        disabled={isJoinLoading}
                        style={{
                            width: 180,
                            height: 35,
                            background: "#46C3A6",
                            borderRadius: 30,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 23,
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                        }}
                        >
                        {isJoinLoading ? "Joining..." : "Join Game"}
                    </Button>
                    </Col>
                </Row>
                </Container>
            </Form>
            <Container style={{ paddingTop: "180px", marginLeft: "0px"}} fluid>
                <Row className="text-center py-3" style={{width: 380, color: 'white', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                <Col>Want to provide game feedback?</Col>
                </Row>
                <Row className="text-center" style={{marginTop:"32px"}}>
                <Col style={{ position: "relative" }}>
                    <Polygon style={{ position: "absolute", top: "-30px", left: "160px" }}/>
                    <Button variant="warning" onClick={handleFeedback}
                        style={{
                            width: 218,
                            height: 38,
                            background: "#46C3A6",
                            borderRadius: 30,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 23,
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                            marginLeft: "120px",
                            marginTop: "-2px",
                        }}
                    >
                    Provide Feedback
                    </Button>
                </Col>
                </Row>
            </Container>
            <Container style={{ paddingTop: "10px", marginTop:"80px", marginLeft: "-8px"}} fluid>
                <Row className="text-center py-3" style={{width: 380, color: 'white', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                <Col>Want to create your own game?</Col>
                </Row>
                <Row className="text-center" style={{marginTop:"16px"}}>
                <Col style={{ position: "relative" }}>
                    <Polygon style={{ position: "absolute", top: "-30px", left: "80px" }} />
                    <Button
                        variant="primary"
                        onClick={createNewGameButton}
                        disabled={isCreateLoading}
                        style={{
                        width: 200,
                        height: 35,
                        background: "#46C3A6",
                        borderRadius: 30,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 23,
                        fontFamily: "Grandstander",
                        fontWeight: "600",
                        wordWrap: "break-word",
                        marginLeft: "50px",
                        }}
                    >
                        {isCreateLoading ? "Creating..." : "Host a Game"}
                    </Button>
                </Col>
                </Row>
            </Container>
        </div>   
     );
}
 
export default StartGame;