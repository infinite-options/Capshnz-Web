import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 4.svg";
import { Col, Container, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";

const ChooseRounds = () => {
    const [gameCode, setGameCode] = useState("");
    const navigate = useNavigate(),
        location = useLocation();
    const userData = location.state;
    const handleGameCodeChange = (event) => {
        setGameCode(event.target.value);
    };
    const continueButton = async (event) => {
        navigate("/SelectDeckPrev", { state: userData });
    };

    return ( 
        <div
            style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center',width: '100%', height: '100vh', background: 'rgba(153, 90, 98, 0.70)'}}
        >
            <Form onSubmit={continueButton} >
                <Container fluid >
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
                            marginTop: "64px",
                        }}
                    >
                        Number of Rounds
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
                        placeholder="Enter # of rounds here..."
                        onChange={handleGameCodeChange}
                        inputMode="numeric"
                    />
                    </Form.Group>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"64px", marginTop:"8px",width: 250, height: 73, color: 'white', fontSize: 24, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> 1 image per round </Col>
                </Row>
                <Row style={{marginLeft:"8px", marginTop:"160px"}}>
                    <Form.Group as={Col} md="10" >
                    <Form.Label
                        style={{
                            width: "330px",
                            color: "white",
                            fontSize: "32px",
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                            marginTop: "64px",
                        }}
                    >
                        Round Time
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
                        placeholder="Enter # of secondes here..."
                        onChange={handleGameCodeChange}
                        inputMode="numeric"
                    />
                    </Form.Group>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"64px", marginTop:"8px",width: 250, height: 73, color: 'white', fontSize: 24, fontFamily: 'Grandstander', fontWeight: '600', wordWrap: 'break-word'}}>
                    <Col> We recommend 60 </Col>
                </Row>
                <Row className="text-center py-3" style={{marginLeft:"90px", marginTop:"64px"}}>
                    <Col>
                    <Button
                        variant="success"
                        type="submit"
                        onClick={continueButton}
                        // disabled={isJoinLoading}
                        style={{
                            width: 330,
                            height: 50,
                            background: "#5E9E94",
                            borderRadius: 30,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            fontSize: 40,
                            fontFamily: "Grandstander",
                            fontWeight: "600",
                            wordWrap: "break-word",
                            marginLeft: "-79px",
                        }}
                        >
                        {/* {isJoinLoading ? "Joining..." : "Join Game"} */}
                        Continue
                    </Button>
                    </Col>
                </Row>
                </Container>
            </Form>
        </div>
    );
}
 
export default ChooseRounds;