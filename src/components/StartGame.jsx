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
        
    };
    
    const handleFeedback = () => {
        navigate("/Feedback", { state: userData });
    };

    return ( 
        <div
            style={{width: 430, height: 932, position: 'relative', background: 'rgba(241, 205, 92, 0.73)'}}
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
                <Row className="d-flex justify-content-center">
                    <Form.Group as={Col} md="10">
                    <Form.Label
                        style={{
                            width: "383px",
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
                            width: 391,
                            height: 62.38,
                            background: "white",
                            borderRadius: 40,
                            color: "black",
                            fontSize: 26,
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
                <Row className="text-center py-3">
                    <Col>
                    <Button
                        variant="success"
                        type="submit"
                        disabled={isJoinLoading}
                        style={{
                            width: 218,
                            height: 38,
                            background: "#46C3A6",
                            borderRadius: 30,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 31,
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                            marginLeft: "50px",
                        }}
                        >
                        {isJoinLoading ? "Joining..." : "Join Game"}
                    </Button>
                    </Col>
                </Row>
                </Container>
            </Form>
            <Container style={{ paddingTop: "150px", marginLeft: "0px"}} fluid>
                <Row className="text-center py-3" style={{width: 401, color: 'white', fontSize: 23, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                <Col>Want to provide game feedback?</Col>
                </Row>
                <Row className="text-center">
                <Col>
                    <Polygon style={{marginLeft:"-32px"}}/>
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
                <Row className="text-center py-3" style={{width: 401, color: 'white', fontSize: 23, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                <Col>Want to create your own game?</Col>
                </Row>
                <Row className="text-center">
                <Col>
                    <Polygon style={{marginLeft:"-216px"}}/>
                    <Button
                    variant="primary"
                    onClick={createNewGameButton}
                    disabled={isCreateLoading}
                    style={{
                        width: 218,
                        height: 38,
                        background: "#46C3A6",
                        borderRadius: 30,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 31,
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