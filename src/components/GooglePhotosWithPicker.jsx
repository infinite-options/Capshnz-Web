// src/components/GooglePhotosWithPicker.jsx
// Google Photos Picker API - Session-Based Implementation (CORRECT)
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { ReactComponent as Polygon } from "../assets/Polygon 1.svg";
import { ReactComponent as CloseButton } from "../assets/close-button.svg";

const GooglePhotosWithPicker = () => {
  console.log("In GooglePhotosWithPicker - Session-Based Picker API");
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(location.state);
  const [cookies, setCookie] = useCookies(["userData"]);
  
  const [accessToken, setAccessToken] = useState(null);
  const [isLoadingPicker, setIsLoadingPicker] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [polling, setPolling] = useState(false);

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  // Check if we have the required credentials
  useEffect(() => {
    if (!clientId) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID in .env");
      setError("Google Client ID missing. Please check your .env file.");
    }
  }, [clientId]);

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleIdentity = () => {
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        setPickerInited(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("✅ Google Identity Services loaded");
        setPickerInited(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Google Identity Services");
        setError("Failed to load Google services. Please refresh the page.");
      };
      document.body.appendChild(script);
    };

    loadGoogleIdentity();
  }, []);

  // Start the Picker flow
  const startPhotoPicker = async () => {
    if (!pickerInited) {
      setError("Google services are still loading. Please wait...");
      return;
    }

    if (!window.google || !window.google.accounts) {
      setError("Google Identity Services not available. Please refresh the page.");
      return;
    }

    setIsLoadingPicker(true);
    setError(null);

    try {
      // Step 1: Get OAuth token
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/photospicker.mediaitems.readonly",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error("❌ Token error:", tokenResponse);
            setError("Authentication failed. Please try again.");
            setIsLoadingPicker(false);
            return;
          }

          console.log("✅ Access token received");
          setAccessToken(tokenResponse.access_token);
          
          // Step 2: Create a picker session
          await createPickerSession(tokenResponse.access_token);
        },
      });

      tokenClient.requestAccessToken({ prompt: "" });
    } catch (err) {
      console.error("❌ Error starting picker:", err);
      setError("Failed to start photo picker. Please try again.");
      setIsLoadingPicker(false);
    }
  };

  // Create a Picker session
  const createPickerSession = async (token) => {
    try {
      console.log("📸 Creating Picker session...");

      const response = await fetch(
        "https://photospicker.googleapis.com/v1/sessions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Optional configuration
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Session creation failed:", errorText);
        throw new Error("Failed to create picker session");
      }

      const sessionData = await response.json();
      console.log("✅ Session created:", sessionData);
      
      const pickerSessionId = sessionData.id;
      const pickerUri = sessionData.pickerUri;
      
      setSessionId(pickerSessionId);

      // Step 3: Open the picker URL
      openPickerWindow(pickerUri, token);

    } catch (error) {
      console.error("❌ Error creating session:", error);
      setError("Failed to initialize photo picker. Please try again.");
      setIsLoadingPicker(false);
    }
  };

  // Open the Picker window
  const openPickerWindow = (pickerUri, token) => {
    try {
      console.log("🖼️ Opening Picker window...");
      
      // Open picker in a new window/tab
      // Adding /autoclose will automatically close the window after selection
      const pickerWindow = window.open(
        pickerUri + "/autoclose",
        "PhotoPicker",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!pickerWindow) {
        setError("Popup blocked. Please allow popups for this site.");
        setIsLoadingPicker(false);
        return;
      }

      // Start polling the session
      startPollingSession(token);

    } catch (error) {
      console.error("❌ Error opening picker:", error);
      setError("Failed to open photo picker.");
      setIsLoadingPicker(false);
    }
  };

  // Poll the session to check if user has selected photos
  const startPollingSession = async (token) => {
    setPolling(true);
    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)

    const pollInterval = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        setPolling(false);
        setIsLoadingPicker(false);
        setError("Picker timed out. Please try again.");
        return;
      }

      try {
        console.log(`📊 Polling session... (attempt ${attempts})`);

        const response = await fetch(
          `https://photospicker.googleapis.com/v1/sessions/${sessionId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to poll session");
        }

        const sessionData = await response.json();
        console.log("Session status:", sessionData);

        // Check if mediaItemsSet is true
        if (sessionData.mediaItemsSet === true) {
          console.log("✅ Media items set!");
          clearInterval(pollInterval);
          setPolling(false);
          
          // Fetch the selected media items
          await fetchSelectedMediaItems(token);
        }

      } catch (error) {
        console.error("❌ Polling error:", error);
        // Continue polling despite errors
      }

    }, 5000); // Poll every 5 seconds
  };

  // Fetch selected media items
  const fetchSelectedMediaItems = async (token) => {
    try {
      console.log("📥 Fetching selected media items...");

      const response = await fetch(
        `https://photospicker.googleapis.com/v1/sessions/${sessionId}/mediaItems`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch media items");
      }

      const data = await response.json();
      console.log("✅ Media items received:", data);

      if (data.mediaItems && data.mediaItems.length > 0) {
        // Extract photo URLs
        const photoUrls = data.mediaItems.map(item => {
          // Get high-resolution URLs
          return item.mediaItem.baseUrl + "=w2048-h2048";
        });

        setSelectedPhotos(photoUrls);
        console.log(`✅ Loaded ${photoUrls.length} photos`);
      } else {
        setError("No photos were selected.");
      }

    } catch (error) {
      console.error("❌ Error fetching media items:", error);
      setError("Failed to load selected photos. Please try again.");
    } finally {
      setIsLoadingPicker(false);
    }
  };

  // Submit selected photos
  const submitPhotos = () => {
    if (selectedPhotos.length < userData.numOfRounds) {
      alert(
        `Please select at least ${userData.numOfRounds} images for your game.\n\nCurrently selected: ${selectedPhotos.length} photo(s)`
      );
      return;
    }

    const updatedUserData = {
      ...userData,
      deckSelected: true,
      isApi: true,
      deckTitle: "Google Photos",
      deckUID: "500-000005",
      googlePhotos: selectedPhotos,
    };

    console.log("✅ Navigating to WaitingRoom with Google Photos");
    navigate("/WaitingRoom", { state: updatedUserData });
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        minHeight: "100vh",
        background: "#C8DAD8",
        padding: "2rem",
        paddingBottom: "1rem",
      }}
    >
      <Container>
        <Row className="text-center">
          <Col>
            <CloseButton
              onClick={() => navigate("/SelectDeck", { state: userData })}
              style={{ position: "absolute", right: 5, top: 5, cursor: "pointer" }}
            />
          </Col>
        </Row>

        <Row className="text-center mb-4">
          <Col style={{ position: "relative" }}>
            <Polygon style={{ position: "absolute", bottom: "-32px", right: "80px" }} />
            <input
              type="text"
              style={{
                width: 350,
                height: 60,
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
                marginTop: "32px",
                border: "none",
                outline: "none",
                textAlign: "center",
              }}
              value="Google Photos"
              readOnly
            />
          </Col>
        </Row>

        {error && (
          <Row className="text-center mb-3">
            <Col>
              <Alert variant="danger" style={{ fontFamily: "Grandstander" }}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="text-center mb-4" style={{ marginTop: "64px" }}>
          <Col>
            <div>
              <p
                style={{
                  fontFamily: "Grandstander",
                  fontSize: "18px",
                  marginBottom: "1.5rem",
                  color: "#333",
                }}
              >
                Select photos from your Google Photos library
              </p>
              <Button
                onClick={startPhotoPicker}
                disabled={!pickerInited || isLoadingPicker || polling}
                style={{
                  width: 300,
                  height: 50,
                  background: "#46C3A6",
                  borderRadius: 30,
                  fontSize: 20,
                  fontFamily: "Grandstander",
                  fontWeight: "600",
                  border: "none",
                }}
              >
                {isLoadingPicker || polling ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      style={{ marginRight: "8px" }}
                    />
                    {polling ? "Waiting for selection..." : "Loading..."}
                  </>
                ) : (
                  "Select Photos"
                )}
              </Button>
              {polling && (
                <p style={{ fontFamily: "Grandstander", fontSize: "14px", color: "#666", marginTop: "1rem" }}>
                  Select your photos in the popup window. This page will update automatically.
                </p>
              )}
            </div>
          </Col>
        </Row>

        {selectedPhotos.length > 0 && (
          <>
            <Row className="text-center mb-3">
              <Col>
                <p
                  style={{
                    fontFamily: "Grandstander",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Selected {selectedPhotos.length} photo(s)
                  <br />
                  <small style={{ fontSize: "16px", fontWeight: "400", color: "#666" }}>
                    (Need at least {userData.numOfRounds} for your game)
                  </small>
                </p>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem",
                    maxHeight: "400px",
                    overflowY: "auto",
                    padding: "1rem",
                    background: "white",
                    borderRadius: "10px",
                  }}
                >
                  {selectedPhotos.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Selected ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "2px solid #46C3A6",
                      }}
                      onError={(e) => {
                        console.error("❌ Image failed to load:", url);
                        e.target.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </Col>
            </Row>

            <Row className="text-center">
              <Col>
                <Button
                  onClick={submitPhotos}
                  disabled={selectedPhotos.length < userData.numOfRounds}
                  style={{
                    width: 300,
                    height: 50,
                    background:
                      selectedPhotos.length >= userData.numOfRounds
                        ? "#71CAA3"
                        : "#ccc",
                    borderRadius: 30,
                    fontSize: 20,
                    fontFamily: "Grandstander",
                    fontWeight: "600",
                    border: "none",
                    cursor: selectedPhotos.length >= userData.numOfRounds ? "pointer" : "not-allowed",
                  }}
                >
                  Continue to Game ({selectedPhotos.length} selected)
                </Button>
              </Col>
            </Row>
          </>
        )}

        <Row className="text-center mt-4">
          <Col>
            <Button
              variant="link"
              onClick={() => navigate("/SelectDeck", { state: userData })}
              style={{
                fontFamily: "Grandstander",
                color: "#666",
                textDecoration: "underline",
              }}
            >
              ← Back to Deck Selection
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GooglePhotosWithPicker;