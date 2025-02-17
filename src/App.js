import GameRules from "./components/GameRules";
import Confirmation from "./components/Confirmation";
import UserInfo from "./components/UserInfo";
import JoinGame from "./components/JoinGame";
import Feedback from "./components/Feedback";

import RoundType from "./components/RoundType";
import ScoreType from "./components/ScoreType";

import SelectDeck from "./components/SelectDeck";
import GooglePhotos from "./components/GooglePhotos";

import EndGame from "./components/EndGame";
import CnnDeck from "./components/CnnDeck";
import ApiError from "./components/ApiError";
import StartGame from "./components/StartGame";
import ChooseScoring from "./components/ChooseScoring";
import ChooseRounds from "./components/ChooseRounds";
import FinalScore from "./components/FinalScore";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CookiesProvider } from "react-cookie";
import { createContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import WaitingRoom from "./components/WaitingRoom";
import LandingNew from "./components/LandingNew";
import VerificationOtp from "./components/VerificationOtp";
import EnterName from "./components/EnterName";
import CaptionNew from "./components/CaptionNew";
import VoteImage from "./components/VoteImage";
import ScoreboardNew from "./components/ScoreboardNew";
import MidGameWaitingRoom from "./components/MidGameWaitingRoom";

export const ErrorContext = createContext();

export default function App() {
  const [show, setShow] = useState(false);
  const [onRetry, setOnRetry] = useState(() => {});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className='app'>
      <ErrorContext.Provider value={{ setShow, setOnRetry, setTitle, setDescription }}>
        <ApiError show={show} onRetry={onRetry} title={title} description={description} />
        <GoogleOAuthProvider clientId='336598290180-69pe1qeuqku450vnoi8v1ehhi19jhpmt.apps.googleusercontent.com'>
          <CookiesProvider>
            <Router>
              <Routes>
                <Route path='/UserInfo' element={<UserInfo />} />
                <Route path='/JoinGame' element={<JoinGame />} />
                <Route path='/Feedback' element={<Feedback />} />
                <Route path='/GameRules' element={<GameRules />} />
                <Route path='/Confirmation' element={<Confirmation />} />
                <Route path='/ScoreType' element={<ScoreType />} />
                <Route path='/RoundType' element={<RoundType />} />

                <Route path='/SelectDeck' element={<SelectDeck />} />
                <Route path='/GooglePhotos' element={<GooglePhotos />} />

                <Route path='/EndGame' element={<EndGame />} />
                <Route path='/CnnDeck' element={<CnnDeck />} />
                <Route path='/StartGame' element={<StartGame />} />
                <Route path='/ChooseScoring' element={<ChooseScoring />} />
                <Route path='/ChooseRounds' element={<ChooseRounds />} />
                <Route path='/FinalScore' element={<FinalScore />} />
                <Route path='/WaitingRoom' element={<WaitingRoom />} />
                <Route path='/' element={<LandingNew />} />
                <Route path='/VerificationOtp' element={<VerificationOtp />} />
                <Route path='/EnterName' element={<EnterName />} />
                <Route path='/CaptionNew' element={<CaptionNew />} />
                <Route path='/VoteImage' element={<VoteImage />} />
                <Route path='/ScoreboardNew' element={<ScoreboardNew />} />
                <Route path='/MidGameWaitingRoom' element={<MidGameWaitingRoom />} />
              </Routes>
            </Router>
          </CookiesProvider>
        </GoogleOAuthProvider>
      </ErrorContext.Provider>
    </div>
  );
}
