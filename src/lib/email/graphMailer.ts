export interface MailAttachment {
  name: string;
  contentType: string;
  contentBytes: string;
}

export interface SendMailParams {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  htmlBody: string;
  attachments?: MailAttachment[];
  replyTo?: string;
  saveToSent?: boolean;
}

export async function sendMailFromSharedBox(params: SendMailParams): Promise<void> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const sharedMailbox = process.env.GRAPH_SHARED_MAILBOX;

  if (!tenantId || !clientId || !clientSecret || !sharedMailbox) {
    console.warn('[email] Microsoft Graph not configured — skipping email send');
    return;
  }

  // Dynamic import to avoid breaking app when creds not configured
  const { Client } = await import('@microsoft/microsoft-graph-client');
  const { ClientSecretCredential } = await import('@azure/identity');
  const { TokenCredentialAuthenticationProvider } = await import(
    '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js'
  );

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });
  const client = Client.initWithMiddleware({ authProvider });

  const toAddresses = Array.isArray(params.to) ? params.to : [params.to];
  const ccAddresses = params.cc ? (Array.isArray(params.cc) ? params.cc : [params.cc]) : [];

  const message: Record<string, unknown> = {
    subject: params.subject,
    body: { contentType: 'html', content: params.htmlBody },
    toRecipients: toAddresses.map((address) => ({ emailAddress: { address } })),
    ccRecipients: ccAddresses.map((address) => ({ emailAddress: { address } })),
  };

  if (params.replyTo) {
    message.replyTo = [{ emailAddress: { address: params.replyTo } }];
  }
  if (params.attachments?.length) {
    message.attachments = params.attachments.map((att) => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: att.name,
      contentType: att.contentType,
      contentBytes: att.contentBytes,
    }));
  }

  await client.api(`/users/${sharedMailbox}/sendMail`).post({
    message,
    saveToSentItems: params.saveToSent ?? true,
  });
}
