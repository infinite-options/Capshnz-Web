import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleApiError } from "../util/ApiHelper";
import { ErrorContext } from "../App";
import { addUser, checkGameCode, joinGame } from "../util/Api";
import {ReactComponent as Polygon} from "../assets/Polygon 1.svg";
import {ReactComponent as Cleveland} from "../assets/image 6.svg";
import {ReactComponent as Google} from "../assets/image 5.svg";
import {ReactComponent as Chicago} from "../assets/image 7.svg";
import {ReactComponent as Giphy} from "../assets/image 8.svg";
import {ReactComponent as Harvard} from "../assets/image 9.svg";
import {ReactComponent as CNN} from "../assets/image 10.svg";
import { Col, Container, Row, Stack } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/fonts.css";

import "../styles/Landing.css";

const SelectingDeck = () => {
    const [gameCode, setGameCode] = useState("");
    const navigate = useNavigate(),
        location = useLocation();
    const userData = location.state;
    const [isCreateLoading, setCreateLoading] = useState(false);
    const [isJoinLoading, setJoinLoading] = useState(false);
    const context = useContext(ErrorContext);

    const handleClick = () => {
        navigate("/FinalScore", { state: userData });
    };
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%', 
                height: '100vh', 
                background: '#C8DAD8',
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
                <Row className="text-center">
                    <Col style={{ position: "relative" }}>
                        <Polygon style={{ position: "absolute", bottom: "-32px", right: "80px" }}/>
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
                                fontSize: 24,
                                fontFamily: "Grandstander",
                                fontWeight: "700",
                                wordWrap: "break-word",
                                marginLeft: "0px",
                                marginTop: "32px",
                                border: "none", 
                                outline: "none", 
                                textAlign: "center",
                            }}
                            value="Select a Deck" 
                            readOnly 
                        />
                    </Col>
                </Row>
                <div style={{marginTop:"128px", marginLeft:"40px"}}>
                    <Row>
                        <Col>
                            <Google onClick={handleClick}/>
                            <Row className="text-center py-3" style={{marginLeft:"-40px", marginTop:"2px",width: 200, color: '#FFF', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word'}}>
                                <Col> Google Photos </Col>
                            </Row>
                        </Col>
                        <Col>   
                            <Cleveland/>
                            <Row className="text-center py-3" style={{marginLeft:"-40px", marginTop:"2px",width: 200, color: '#FFF', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word'}}>
                                <Col> Cleveland Callery </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Chicago/>
                            <Row className="text-center py-3" style={{marginLeft:"-40px", marginTop:"2px",width: 200, color: '#FFF', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word'}}>
                                <Col> Chicago Gallery </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Giphy/>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Harvard/>
                            <Row className="text-center py-3" style={{marginLeft:"-40px", marginTop:"2px",width: 200, color: '#FFF', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word'}}>
                                <Col> Harvard Gallery </Col>
                            </Row>
                        </Col>
                        <Col>
                            <CNN/>
                            <Row className="text-center py-3" style={{marginLeft:"-40px", marginTop:"2px",width: 200, color: '#FFF', fontSize: 20, fontFamily: 'Grandstander', fontWeight: '700', wordWrap: 'break-word'}}>
                                <Col> CNN Gallery </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>
            </div>
        </div>
     );
}
 
export default SelectingDeck;