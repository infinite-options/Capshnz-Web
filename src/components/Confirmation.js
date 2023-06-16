import { useContext, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCookies } from 'react-cookie'
import ReactCodeInput from "react-code-input"
import { checkEmailCode } from "../util/Api.js"
import "../styles/Confirmation.css"
import { handleApiError } from "../util/ApiHelper.js"
import { ErrorContext } from "../App.js"
import { Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";

const codeInputStyle = {
    borderRadius: '6px',
    border: '1px solid',
    boxShadow: '0px 0px 10px 0px rgba(0,0,0,.10)',
    margin: '4px',
    padding: '0 0 0 10px',
    width: '40px',
    height: '46px',
    fontSize: '32px',
    boxSizing: 'border-box',
}

export default function Confirmation(){
    const navigate = useNavigate(), location = useLocation()
    const userData = location.state
    const [code, setCode] = useState("")
    const [valid, setValid] = useState(true)
    const context = useContext(ErrorContext)

    function handleChange(code){
        setCode(code)
    }

    async function submitButton(){
        try {
            const status = await checkEmailCode(userData.playerUID, code)
            if(status.email_validated_status === "TRUE"){
                // if(userData.host){
                //     navigate("/ScoreType", {state: userData})
                // }
                // else if(!userData.host){
                //     await joinGame(userData)
                //     const channel = ably.channels.get(`BizBuz/${userData.gameCode}`)
                //     publish({data: {message: "New Player Joined Lobby"}})
                //     navigate("/Waiting", {state: userData})
                // }
                navigate("/JoinGame", { state: userData });
            }
            else{
                setValid(false)
                setTimeout(() => {
                    setValid(true)
                }, 2500)
            }
        } catch(error) {
            handleApiError(error, submitButton, context)
        }
    }

    function handleEmailChange() {
        navigate("/")
    }

    return(
        <div className="confirmation">
            <br/>
            <br/>
            <h1>Confirmation Page</h1>
            <h5>Enter the 3 digit code sent to: {userData.email}</h5>
            {!valid &&
                <h3 className="validConfirmation">Invalid Code. Please Try Again.</h3>
            }
            <ReactCodeInput type='number' inputStyle={codeInputStyle} fields={3} onChange={handleChange}/>
            <br/>
            <br/>
            {/* <button className="buttonConfirmation" onClick={submitButton}>
                Submit
            </button> */}
            <Button variant="success" onClick={submitButton}>
              Enter
            </Button>
            <Container style={{ paddingTop: "200px" }} fluid>
                <Row className="text-center py-3">
                    <Col>Don't have access to {userData.email}?</Col>
                </Row>
                <Row className="text-center">
                    <Col>
                        <Button variant="warning" 
                            onClick={handleEmailChange}>
                            Enter a different email
                        </Button>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}