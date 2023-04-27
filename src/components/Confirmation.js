import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useCookies } from 'react-cookie'
import ReactCodeInput from "react-code-input"
import { ably, checkEmailCode, joinGame } from "../util/Api.js"
import "../styles/Confirmation.css"

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
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [code, setCode] = useState("")
    const [valid, setValid] = useState(true)

    function handleChange(code){
        setCode(code)
    }

    async function submitButton(){
        const status = await checkEmailCode(userData.playerUID, code)
        if(status.email_validated_status === "TRUE"){
            if(userData.host){
                navigate("/ScoreType", {state: userData})
            }
            else if(!userData.host){
                await joinGame(userData)
                const channel = ably.channels.get(`BizBuz/${userData.gameCode}`)
                channel.publish({data: {message: "New Player Joined Lobby"}})
                navigate("/Waiting", {state: userData})
            }
        }
        else{
            setValid(false)
            setTimeout(() => {
                setValid(true)
            }, 2500)
        }
    }

    return(
        <div className="confirmation">
            <br/>
            <br/>
            <h1>Confirmation Page</h1>
            <h5>Please enter the code that was sent to {userData.email}</h5>
            {!valid &&
                <h3 className="validConfirmation">Invalid Code. Please Try Again.</h3>
            }
            <ReactCodeInput type='text' inputStyle={codeInputStyle} fields={3} onChange={handleChange}/>
            <br/>
            <br/>
            <button className="buttonConfirmation" onClick={submitButton}>
                Submit
            </button>
        </div>
    )
}