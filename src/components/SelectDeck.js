import { useState, useEffect, useContext } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useCookies } from 'react-cookie'
import useAbly from "../util/ably.js"
import { getDecks, selectDeck } from "../util/Api.js"
import "../styles/SelectDeck.css"
import { ErrorContext } from "../App.js"
import { handleApiError } from "../util/ApiHelper.js"

export default function SelectDeck(){
    const navigate = useNavigate(), location = useLocation()
    const [userData, setUserData] = useState(location.state)
    const [cookies, setCookie] = useCookies(["userData"])
    const [decksInfo, setDecksInfo] = useState([])
    const { publish } = useAbly(userData.gameCode)
    const context = useContext(ErrorContext)

    useEffect( () => {
        async function getDecksInfo(){
            const decksInfo = await getDecks(userData.playerUID)
            setDecksInfo(decksInfo)
        }
        getDecksInfo()
    }, [userData.playerUID])
    async function handleClick(deckTitle, deckUID,thumbnail_url) {
        try {
            await selectDeck(deckUID, userData.gameCode, userData.roundNumber)
            let isApi
            if(deckTitle === "Google Photos"){
                await publish({data: {message: "Deck Selected"}})
                navigate("/GooglePhotos", {state: userData})
                return
            }
            else if (deckTitle === "Cleveland Gallery" || deckTitle === "Chicago Gallery" ||
                deckTitle === "Giphy Gallery" || deckTitle === "Harvard Gallery" || deckTitle === "CNN Gallery") {
                isApi = true
            }
            else {
                isApi = false
            }
            const updatedUserData = {
                ...userData,
                isApi: isApi,
                deckSelected: true,
                deckTitle: deckTitle,
                deckUID: deckUID,
                deckThumbnail_url: thumbnail_url
            }
            setUserData(updatedUserData)
            setCookie("userData", updatedUserData, { path: '/' })
            if (deckTitle === "CNN Gallery") {
                navigate("/CnnDeck", {state: updatedUserData})
            } else {
                navigate("/Waiting", {state: updatedUserData})    
            }
        } catch(error) {
            handleApiError(error, ()=>handleClick(deckTitle, deckUID,thumbnail_url), context)
        }
    }

    return(
        <div className="selectDeck">
            <div>
            <Link to="/GameRules" className="gameRulesSelectDeck">
                <i className="fa fa-info-circle"></i>
                Game Rules
            </Link>
            </div>

            <h4 className="oneSelectDeck">Select a deck</h4>
            <br/>
            <br/>
            <ul className="deck-container">
                {decksInfo.map((deck, index) => {
                    if(deck.user_uid !== "PRIVATE"){
                        return(
                            <div key={index} onClick={event => handleClick(deck.deck_title, deck.deck_uid,deck.deck_thumbnail_url)} className="deck">
                                <div className="deck-background">
                                    <img src={deck.deck_thumbnail_url} alt={deck.deck_title} className="deck-image"/>
                                    <div className="deckText">
                                        {deck.deck_title} (Free)
                                    </div>
                                </div>
                                <br/>
                            </div>
                        )
                    }
                })}
            </ul>
        </div>
    )
}