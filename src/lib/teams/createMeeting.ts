export interface TeamsMeetingResult {
  meetingLink: string | null;
  teamsMeetingId: string | null;
  error?: string;
}

export async function createTeamsMeeting(params: {
  subject: string;
  startTime: Date;
  durationMins?: number;
  attendees?: string[];
}): Promise<TeamsMeetingResult> {
  const tenantId    = process.env.AZURE_TENANT_ID;
  const clientId    = process.env.AZURE_CLIENT_ID;
  const clientSecret= process.env.AZURE_CLIENT_SECRET;
  const organizer   = process.env.TEAMS_ORGANIZER_EMAIL;

  if (!tenantId || !clientId || !clientSecret || !organizer) {
    return { meetingLink: null, teamsMeetingId: null, error: 'Teams not configured' };
  }

  try {
    const { Client } = await import('@microsoft/microsoft-graph-client');
    const { ClientSecretCredential } = await import('@azure/identity');
    const { TokenCredentialAuthenticationProvider } = await import(
      '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
    );

    const credential    = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const authProvider  = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });
    const client = Client.initWithMiddleware({ authProvider });

    const endTime = new Date(params.startTime.getTime() + (params.durationMins ?? 60) * 60 * 1000);

    const event = await client.api(`/users/${organizer}/events`).post({
      subject: params.subject,
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
      start: { dateTime: params.startTime.toISOString(), timeZone: 'UTC' },
      end:   { dateTime: endTime.toISOString(),          timeZone: 'UTC' },
      attendees: (params.attendees ?? []).map((email) => ({
        emailAddress: { address: email },
        type: 'required',
      })),
    });

    return {
      meetingLink: event.onlineMeeting?.joinUrl ?? null,
      teamsMeetingId: event.id ?? null,
    };
  } catch (err) {
    console.error('[teams] Meeting creation failed:', err);
    return { meetingLink: null, teamsMeetingId: null, error: 'Teams meeting creation failed' };
  }
}
