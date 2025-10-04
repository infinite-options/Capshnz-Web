import { useEffect, useState } from 'react';

/* global google */

const PhotoPicker = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const handlePhotoPicker = async () => {
      // Extract sessionId from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdParam = urlParams.get('sessionId');
      
      if (!sessionIdParam) {
        setError('No sessionId provided');
        setLoading(false);
        return;
      }
      
      setSessionId(sessionIdParam);

      try {
        // Step 1: Load Google API scripts
        await loadGoogleScripts();
        
        // Step 2: Get access token from backend using sessionId
        const tokenResponse = await fetch(`https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev/api/oauth/token/${sessionIdParam}`);
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
          setError('Failed to get access token');
          setLoading(false);
          return;
        }

        // Step 3: Load Google Picker
        await loadGooglePicker();
        
        // Step 4: Create and show picker
        createPicker(tokenData.access_token, sessionIdParam);
        
      } catch (err) {
        setError('Failed to initialize photo picker: ' + err.message);
        setLoading(false);
      }
    };

    handlePhotoPicker();
  }, []);

  const loadGoogleScripts = () => {
    return new Promise((resolve) => {
      if (window.gapi && window.gapi.load) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        const checkGapi = () => {
          if (window.gapi && window.gapi.load) {
            resolve();
          } else {
            setTimeout(checkGapi, 100);
          }
        };
        checkGapi();
      };
      document.head.appendChild(script);
    });
  };

  const loadGooglePicker = () => {
    return new Promise((resolve, reject) => {
      window.gapi.load('picker', {
        callback: resolve,
        onerror: reject,
      });
    });
  };

  const createPicker = (accessToken, sessionId) => {
    const pickerCallback = (data) => {
      if (data.action === google.picker.Action.PICKED) {
        const docs = data[google.picker.Response.DOCUMENTS];
        const selected = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          url: doc.url,
          thumbnail: doc.thumbnails?.[0]?.url || null,
        }));

        // Send selected photos to backend
        fetch('https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev/api/picker/selection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, selection: selected }),
        })
        .then(() => {
          // Redirect to mobile app
          window.location.href = `googleapidemo://photos/selection?sessionId=${encodeURIComponent(sessionId)}`;
        })
        .catch(err => {
          setError('Failed to save photo selection: ' + err.message);
        });
      }
    };

    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.PHOTOS)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build();
    
    picker.setVisible(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading Google Photo Picker...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Google Photo Picker is loading...</p>
    </div>
  );
};

export default PhotoPicker;
