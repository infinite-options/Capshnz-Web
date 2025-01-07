import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // I made change here
import { useCookies } from "react-cookie"; // I made change here
import { getCnnImageURLS, sendError } from "../util/Api.js"; // I made change here
import "../styles/CnnDeck.css";

export default function CnnDeck() {
  const navigate = useNavigate(),
    location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]); // I made change here
  const [CNNImageURL, setCNNImageURL] = useState([]);
  const [loadingImg, setloadingImg] = useState(0);
  const isMessageDisplayed = useRef(false);

  useEffect(() => {
    async function getCnnURLS() {
      let response = await getCnnImageURLS();
      const CNNImageURLResponse = response["data"];
      console.log("CNNImageURLResponse", CNNImageURLResponse);
      if (CNNImageURLResponse.length === 0) {
        setloadingImg(3);
        isMessageDisplayed.current = true;
        let code1 = "CNN Deck is not loading";
        let code2 = "loading for the user" + userData.alias;
        alert("The CNN deck may not be available right now.  Please select another deck.");
        sendError(code1, code2);
      } else {
        setloadingImg(4);
        setCNNImageURL(CNNImageURLResponse);
      }
    }
    if (loadingImg === 0) {
      setloadingImg(1);
      getCnnURLS();
    }

    const interval = setInterval(() => {
      if (!isMessageDisplayed.current) {
        if (loadingImg === 1) {
          alert("Loading of the CNN deck is taking longer than expected.  Please be patient.");
          setloadingImg(2);
        } else if (loadingImg === 2) {
          setloadingImg(3);
          isMessageDisplayed.current = true;
          let code1 = "CNN Deck is not loading";
          let code2 = "loading for the user" + userData.alias;
          alert("The CNN deck may not be available right now.  Please select another deck.");
          sendError(code1, code2);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadingImg]);

  async function handleClick(Link_Url) {
    const updatedUserData = {
      ...userData,
      CNN_URL: Link_Url,
    };
    setUserData(updatedUserData);
    setCookie("userData", updatedUserData, { path: "/" });
    console.log("navigate WR 2");
    navigate("/WaitingRoom", { state: updatedUserData });
  }

  return (
    <div
      className='CnnDeckContainer'
      style={{
        fontFamily: "Grandstander",
      }}
    >
      <h2 className='page-heading'> Select Deck from the list</h2>
      {CNNImageURL.map((CNNImage, index) => (
        <div key={index} className='CnnCard' onClick={() => handleClick(CNNImage.article_link)}>
          <img src={CNNImage.thumbnail_link} alt={CNNImage.year} className='CnnCardImage' />
          <div className='CnnCardText'>
            <h2>{CNNImage.title}</h2>
            {CNNImage.date}
          </div>
        </div>
      ))}
    </div>
  );
}
