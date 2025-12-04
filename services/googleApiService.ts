
// VEUILLEZ REMPLACER CES VALEURS PAR VOS PROPRES CLÉS DEPUIS LA GOOGLE CLOUD CONSOLE
// Console: https://console.cloud.google.com/
// Activer l'API "Google Calendar API" et configurer l'écran de consentement OAuth
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // À REMPLACER PAR VOTRE CLIENT ID
const API_KEY = 'YOUR_API_KEY'; // À REMPLACER PAR VOTRE API KEY

// Scopes nécessaires pour créer des événements
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Helper simple pour décoder le JWT Google
const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const googleApiService = {
  clientId: CLIENT_ID, // Expose pour Auth.tsx

  // Initialisation des scripts Google (Calendar/Meet)
  init: (onInitComplete: (isAuthorized: boolean) => void) => {
    // Si pas de clé valide, on skip l'init réelle pour éviter les erreurs console
    if (CLIENT_ID.startsWith('YOUR_')) {
        console.warn("[Google API] Clés non configurées. Mode simulation activé.");
        onInitComplete(false);
        return;
    }

    const gapiLoaded = () => {
      if(!window.gapi) return;
      window.gapi.load('client', async () => {
        try {
            await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            onInitComplete(false);
        } catch (e) {
            console.error("Erreur init GAPI", e);
        }
      });
    };

    const gisLoaded = () => {
      if(!window.google) return;
      try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // défini lors de la demande
          });
          gisInited = true;
      } catch (e) {
          console.error("Erreur init GIS", e);
      }
    };

    // Chargement dynamique
    if (window.gapi) gapiLoaded();
    if (window.google) gisLoaded();
  },

  // Traitement de la réponse Google Sign-In (Login)
  handleCredentialResponse: (response: any) => {
      const responsePayload = parseJwt(response.credential);
      if (responsePayload) {
          return {
              email: responsePayload.email,
              firstName: responsePayload.given_name,
              lastName: responsePayload.family_name,
              picture: responsePayload.picture,
              sub: responsePayload.sub // ID unique Google
          };
      }
      return null;
  },

  // Demande de permission pour Calendar/Meet
  login: async (): Promise<boolean> => {
    // SIMULATION si pas de clé
    if (CLIENT_ID.startsWith('YOUR_')) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const confirmMock = confirm("[MODE DEV] Simuler une connexion Google réussie ?");
                if (confirmMock) resolve(true);
                else resolve(false); // ou reject
            }, 500);
        });
    }

    return new Promise((resolve, reject) => {
      if (!tokenClient) {
          reject("Google API non initialisée. Vérifiez votre connexion.");
          return;
      }

      tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        resolve(true);
      };

      if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        tokenClient.requestAccessToken({prompt: ''});
      }
    });
  },

  // Création du lien Meet
  createMeet: async (title: string, description: string, startTime: string, durationMinutes: number): Promise<string> => {
    // SIMULATION si pas de clé
    if (CLIENT_ID.startsWith('YOUR_')) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`https://meet.google.com/simulated-link-${Date.now()}`);
            }, 1000);
        });
    }

    try {
        const event = {
            'summary': `[Quran SN] ${title}`,
            'description': description,
            'start': {
                'dateTime': new Date(startTime).toISOString(),
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            'end': {
                'dateTime': new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString(),
                'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            'conferenceData': {
                'createRequest': {
                    'requestId': "req-" + Date.now(),
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    }
                }
            }
        };

        const request = window.gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event,
            'conferenceDataVersion': 1
        });

        const response = await request;
        
        if(response.result.conferenceData && response.result.conferenceData.entryPoints) {
            const meetLink = response.result.conferenceData.entryPoints.find((e: any) => e.entryPointType === 'video');
            return meetLink ? meetLink.uri : response.result.htmlLink;
        }
        
        return response.result.htmlLink; 

    } catch (error) {
        console.error("Erreur lors de la création Meet", error);
        throw error;
    }
  }
};
