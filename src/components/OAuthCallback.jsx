import { useEffect } from 'react';

/* global google */

// Load Google API scripts
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

const OAuthCallback = () => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Step 0: Load Google API scripts
      await loadGoogleScripts();

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code) {
        document.body.innerText = 'No code in URL – OAuth failed or user cancelled.';
        return;
      }

      // Step A: Exchange code for tokens via backend
      let tokenResult;
      try {
        const resp = await fetch('https://bmarz6chil.execute-api.us-west-1.amazonaws.com/dev/api/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });
        tokenResult = await resp.json();
      } catch (err) {
        document.body.innerText = 'Token exchange failed: ' + err;
        return;
      }

      if (!tokenResult || !tokenResult.access_token) {
        document.body.innerText = 'No access token returned.';
        return;
      }

      const accessToken = tokenResult.access_token;

      // Step B: Load gapi auth client
      try {
        await new Promise((resolve, reject) => {
          window.gapi.load('client:auth2', {
            callback: resolve,
            onerror: reject,
          });
        });
      } catch (err) {
        document.body.innerText = 'Failed to load Google Auth client: ' + err;
        return;
      }

      // Step C: Load Picker API
      try {
        await new Promise((resolve, reject) => {
          window.gapi.load('picker', {
            callback: resolve,
            onerror: reject,
          });
        });
      } catch (err) {
        document.body.innerText = 'Failed to load Google Picker: ' + err;
        return;
      }

      // Step D: Picker Callback
      function pickerCallback(data) {
        if (data.action === google.picker.Action.PICKED) {
          const docs = data[google.picker.Response.DOCUMENTS];
          const selected = docs.map(doc => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            thumbnail: doc.thumbnails?.[0]?.url || null,
          }));

          // Step E: Send selected files to backend
          fetch('https://capshnz.com/api/picker/selection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state, selection: selected }),
          })
          .then(() => {
            // Step F: Redirect back to mobile app
            window.location.href = `capshnz://photos/done?session=${encodeURIComponent(state)}`;
          });
        }
      }

      // Step G: Build and show the picker
      function createPicker() {
        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.PHOTOS)
          .setOAuthToken(accessToken)
          .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
          .setCallback(pickerCallback)
          .build();
        picker.setVisible(true);
      }

      createPicker();
    };

    handleOAuthCallback();
  }, []);

  return (
    <div>
      <p>Loading Google Picker…</p>
    </div>
  );
};

export default OAuthCallback;
