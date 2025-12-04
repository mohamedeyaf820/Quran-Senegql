
// VEUILLEZ REMPLACER CES VALEURS PAR VOS PROPRES CLÉS DEPUIS LA GOOGLE CLOUD CONSOLE
// Console: https://console.cloud.google.com/
// Activer l'API "Google Calendar API"
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // À REMPLACER
const API_KEY = 'YOUR_API_KEY'; // À REMPLACER

// Scopes nécessaires pour créer des événements
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const googleApiService = {
  // Initialisation des scripts Google
  init: (onInitComplete: (isAuthorized: boolean) => void) => {
    const gapiLoaded = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkAuth();
      });
    };

    const gisLoaded = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // défini lors de la demande
      });
      gisInited = true;
      checkAuth();
    };

    const checkAuth = () => {
        if (gapiInited && gisInited) {
            // Vérifier si un token existe déjà (optionnel dans ce flow simple)
            onInitComplete(false); 
        }
    };

    // Chargement dynamique si les scripts ne sont pas prêts
    if (window.gapi) gapiLoaded();
    if (window.google) gisLoaded();
  },

  // Demande de connexion
  login: async (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
          reject("Google API non initialisée. Vérifiez votre connexion ou les clés API.");
          return;
      }

      tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
        }
        resolve(true);
      };

      if (window.gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({prompt: ''});
      }
    });
  },

  // Création du lien Meet
  createMeet: async (title: string, description: string, startTime: string, durationMinutes: number): Promise<string> => {
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
                    'requestId': "sample123", // Une chaîne aléatoire
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    }
                }
            }
        };

        const request = window.gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event,
            'conferenceDataVersion': 1 // Crucial pour générer le lien Meet
        });

        const response = await request;
        
        if(response.result.conferenceData && response.result.conferenceData.entryPoints) {
            const meetLink = response.result.conferenceData.entryPoints.find((e: any) => e.entryPointType === 'video');
            return meetLink ? meetLink.uri : '';
        }
        
        // Fallback si pas de conférence générée
        return response.result.htmlLink; 

    } catch (error) {
        console.error("Erreur lors de la création Meet", error);
        throw error;
    }
  },

  isAuthenticated: () => {
      return window.gapi && window.gapi.client && window.gapi.client.getToken() !== null;
  }
};

// Types globaux pour TS
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}
