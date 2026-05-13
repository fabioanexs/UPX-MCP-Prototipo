// Mock data for FinanceMCP prototype

window.MOCK_DATA = {
  institutions: {
    BR: [
      { id: 'br-itau', name: 'Itaú Unibanco', short: 'IU', color: '#EC7000', provider: 'Pluggy' },
      { id: 'br-bradesco', name: 'Bradesco', short: 'BR', color: '#CC092F', provider: 'Pluggy' },
      { id: 'br-bb', name: 'Banco do Brasil', short: 'BB', color: '#F9D11A', provider: 'Pluggy' },
      { id: 'br-santander', name: 'Santander Brasil', short: 'SA', color: '#EC0000', provider: 'Pluggy' },
      { id: 'br-nubank', name: 'Nubank', short: 'NU', color: '#820AD1', provider: 'Pluggy' },
      { id: 'br-inter', name: 'Banco Inter', short: 'IN', color: '#FF7A00', provider: 'Pluggy' },
      { id: 'br-c6', name: 'C6 Bank', short: 'C6', color: '#1F1F1F', provider: 'Pluggy' },
      { id: 'br-btg', name: 'BTG Pactual', short: 'BT', color: '#003057', provider: 'Pluggy' },
      { id: 'br-caixa', name: 'Caixa Econômica', short: 'CX', color: '#0070AF', provider: 'Pluggy' },
      { id: 'br-xp', name: 'XP Investimentos', short: 'XP', color: '#FFCB05', provider: 'Pluggy' },
    ],
    US: [
      { id: 'us-chase', name: 'Chase', short: 'CH', color: '#117ACA', provider: 'Plaid' },
      { id: 'us-boa', name: 'Bank of America', short: 'BA', color: '#012169', provider: 'Plaid' },
      { id: 'us-wf', name: 'Wells Fargo', short: 'WF', color: '#D71E28', provider: 'Plaid' },
      { id: 'us-citi', name: 'Citibank', short: 'CI', color: '#003B70', provider: 'Plaid' },
      { id: 'us-amex', name: 'American Express', short: 'AX', color: '#016FD0', provider: 'Plaid' },
      { id: 'us-capone', name: 'Capital One', short: 'CO', color: '#004977', provider: 'Plaid' },
      { id: 'us-usbank', name: 'U.S. Bank', short: 'US', color: '#0C2074', provider: 'Plaid' },
      { id: 'us-pnc', name: 'PNC Bank', short: 'PN', color: '#F58025', provider: 'Plaid' },
      { id: 'us-truist', name: 'Truist', short: 'TR', color: '#612141', provider: 'Plaid' },
      { id: 'us-schwab', name: 'Charles Schwab', short: 'CS', color: '#00A0DF', provider: 'Plaid' },
    ],
  },

  connections: [
    {
      id: 'cnx_01',
      institutionId: 'br-itau', name: 'Itaú Unibanco', label: 'Personal — Itaú',
      status: 'active', accounts: 3, lastSyncMin: 4,
      consentExpiresDays: 142, categories: ['ACCOUNTS', 'TRANSACTIONS', 'BALANCES', 'IDENTITY'],
      region: 'BR',
    },
    {
      id: 'cnx_02',
      institutionId: 'br-nubank', name: 'Nubank', label: 'Cartão Roxinho',
      status: 'active', accounts: 2, lastSyncMin: 11,
      consentExpiresDays: 87, categories: ['ACCOUNTS', 'TRANSACTIONS', 'BALANCES'],
      region: 'BR',
    },
    {
      id: 'cnx_03',
      institutionId: 'br-btg', name: 'BTG Pactual', label: 'Investimentos',
      status: 'needs_reauth', accounts: 4, lastSyncMin: 1440,
      consentExpiresDays: 3, categories: ['ACCOUNTS', 'BALANCES', 'INVESTMENTS'],
      region: 'BR',
    },
    {
      id: 'cnx_04',
      institutionId: 'br-inter', name: 'Banco Inter', label: 'Empresa LTDA',
      status: 'syncing', accounts: 1, lastSyncMin: 0,
      consentExpiresDays: 201, categories: ['ACCOUNTS', 'TRANSACTIONS'],
      region: 'BR',
    },
  ],

  mcpClients: [
    {
      id: 'mc_01', name: 'Claude Desktop', host: 'claude.ai/desktop',
      status: 'active', authorizedAt: '2026-04-18', lastUsed: '2 min ago',
      calls24h: 1842, rateLimitState: 'ok',
      scopes: ['accounts.read', 'transactions.read', 'balances.read', 'identity.read'],
      institutions: ['br-itau', 'br-nubank'],
      fingerprint: 'fp_a31c•••de8f',
    },
    {
      id: 'mc_02', name: 'Cursor', host: 'cursor.so',
      status: 'active', authorizedAt: '2026-04-22', lastUsed: '38 min ago',
      calls24h: 412, rateLimitState: 'ok',
      scopes: ['accounts.read', 'transactions.read'],
      institutions: ['br-itau'],
      fingerprint: 'fp_92b1•••70c4',
    },
    {
      id: 'mc_03', name: 'Internal CFO bot', host: 'finops.internal',
      status: 'paused', authorizedAt: '2026-03-30', lastUsed: '5 days ago',
      calls24h: 0, rateLimitState: 'ok',
      scopes: ['accounts.read', 'balances.read'],
      institutions: ['br-btg', 'br-inter'],
      fingerprint: 'fp_5e44•••aa01',
    },
    {
      id: 'mc_04', name: 'Custom MCP host', host: 'mcp.acme.dev',
      status: 'rate_limited', authorizedAt: '2026-05-01', lastUsed: '14 min ago',
      calls24h: 9712, rateLimitState: 'throttled',
      scopes: ['accounts.read', 'transactions.read', 'balances.read'],
      institutions: ['br-itau', 'br-nubank', 'br-inter'],
      fingerprint: 'fp_18cf•••3b22',
    },
  ],

  usage: {
    used: 12842,
    limit: 50000,
    deniedCalls: 184,
    rateLimitedCalls: 612,
    daily: [820, 1140, 980, 1420, 1610, 1890, 2120, 1840, 1620, 1740, 1980, 2240, 1860, 2410, 2630, 1980, 2120, 2440, 2680, 2880, 2540, 2210, 2380, 2620, 2890, 3010, 2780, 2540, 2860, 3120],
  },

  events: [
    { t: '14:32:08', tool: 'transactions.list', client: 'Claude Desktop', inst: 'Itaú', scope: 'transactions.read', dur: '342ms', decision: 'allowed' },
    { t: '14:31:54', tool: 'balances.get', client: 'Cursor', inst: 'Itaú', scope: 'balances.read', dur: '128ms', decision: 'allowed' },
    { t: '14:31:21', tool: 'accounts.list', client: 'Custom MCP host', inst: 'Nubank', scope: 'accounts.read', dur: '—', decision: 'denied', reason: 'rate_limit' },
    { t: '14:30:47', tool: 'identity.get', client: 'Claude Desktop', inst: 'Itaú', scope: 'identity.read', dur: '—', decision: 'step_up', reason: 'sensitive_scope' },
    { t: '14:29:55', tool: 'transactions.list', client: 'Claude Desktop', inst: 'Nubank', scope: 'transactions.read', dur: '418ms', decision: 'allowed' },
  ],

  // Personal access tokens
  tokens: [
    { id: 'pat_01', name: 'CI · finance-bot',  prefix: 'fmcp_a3', scopes: ['accounts.read','balances.read'], created: '2026-04-12', lastUsed: '12 min ago', expires: '2026-07-12', status: 'active' },
    { id: 'pat_02', name: 'Local dev — Bruno', prefix: 'fmcp_91', scopes: ['accounts.read','transactions.read','balances.read','identity.read'], created: '2026-03-22', lastUsed: '2 days ago', expires: '2026-09-22', status: 'active' },
    { id: 'pat_03', name: 'Analytics worker',  prefix: 'fmcp_4f', scopes: ['transactions.read','balances.read'], created: '2026-02-08', lastUsed: 'never', expires: '2026-08-08', status: 'unused' },
    { id: 'pat_04', name: 'Legacy import job', prefix: 'fmcp_8d', scopes: ['accounts.read'], created: '2025-12-01', lastUsed: '3 months ago', expires: '2026-06-01', status: 'expiring' },
    { id: 'pat_05', name: 'Old smoke test',    prefix: 'fmcp_22', scopes: ['accounts.read'], created: '2025-11-04', lastUsed: '—', expires: '2026-05-04', status: 'revoked' },
  ],

  // Scope catalog — what each scope means
  scopeCatalog: [
    { id: 'accounts.read',     label: 'Accounts',      desc: 'Account types, masked numbers, holder names',     sensitivity: 'standard' },
    { id: 'balances.read',     label: 'Balances',      desc: 'Current available balance and currency',          sensitivity: 'standard' },
    { id: 'transactions.read', label: 'Transactions',  desc: 'Historical posted transactions and metadata',     sensitivity: 'standard' },
    { id: 'identity.read',     label: 'Identity',      desc: 'Document numbers, full name, contact info',       sensitivity: 'sensitive' },
    { id: 'investments.read',  label: 'Investments',   desc: 'Positions, allocations, performance',             sensitivity: 'standard' },
    { id: 'cards.read',        label: 'Cards',         desc: 'Linked credit cards, masked numbers, limits',     sensitivity: 'standard' },
    { id: 'statements.read',   label: 'Statements',    desc: 'Monthly statements as structured documents',      sensitivity: 'standard' },
  ],

  // Usage breakdowns
  byClient: [
    { client: 'Claude Desktop',   calls: 7220, share: 0.563 },
    { client: 'Custom MCP host',  calls: 3140, share: 0.245 },
    { client: 'Cursor',           calls: 2310, share: 0.180 },
    { client: 'Internal CFO bot', calls: 172,  share: 0.013 },
  ],
  byInstitution: [
    { inst: 'Itaú Unibanco', calls: 6820, share: 0.531 },
    { inst: 'Nubank',        calls: 3892, share: 0.303 },
    { inst: 'Banco Inter',   calls: 1640, share: 0.128 },
    { inst: 'BTG Pactual',   calls: 490,  share: 0.038 },
  ],

  invoices: [
    { id: 'INV-2026-05', period: 'May 2026',   amount: 'R$ 2,490.00', status: 'open',  due: '2026-05-31' },
    { id: 'INV-2026-04', period: 'April 2026', amount: 'R$ 2,490.00', status: 'paid',  due: '2026-04-30' },
    { id: 'INV-2026-03', period: 'March 2026', amount: 'R$ 1,890.00', status: 'paid',  due: '2026-03-31' },
    { id: 'INV-2026-02', period: 'Feb 2026',   amount: 'R$ 1,890.00', status: 'paid',  due: '2026-02-28' },
  ],

  plan: {
    name: 'Standard',
    price: 'R$ 2,490 / month',
    cycle: 'Billed monthly · resets on the 1st',
    quotaCalls: 50000,
    quotaClients: 10,
    quotaInstitutions: 25,
    retentionDays: 365,
  },

  // Bigger event list for the audit tab
  auditEvents: [
    { t: '2026-05-13 14:32:08', tool: 'transactions.list', client: 'Claude Desktop',   inst: 'Itaú',   scope: 'transactions.read', dur: 342, decision: 'allowed', summary: 'Returned 142 transactions (Apr 13 → May 13)' },
    { t: '2026-05-13 14:31:54', tool: 'balances.get',      client: 'Cursor',           inst: 'Itaú',   scope: 'balances.read',     dur: 128, decision: 'allowed', summary: 'Returned balances for 3 accounts' },
    { t: '2026-05-13 14:31:21', tool: 'accounts.list',     client: 'Custom MCP host',  inst: 'Nubank', scope: 'accounts.read',     dur: 0,   decision: 'denied',  reason: 'rate_limit',      summary: 'Client over per-minute quota (60/60)' },
    { t: '2026-05-13 14:30:47', tool: 'identity.get',      client: 'Claude Desktop',   inst: 'Itaú',   scope: 'identity.read',     dur: 0,   decision: 'step_up', reason: 'sensitive_scope', summary: 'Step-up required — identity scope' },
    { t: '2026-05-13 14:29:55', tool: 'transactions.list', client: 'Claude Desktop',   inst: 'Nubank', scope: 'transactions.read', dur: 418, decision: 'allowed', summary: 'Returned 87 transactions' },
    { t: '2026-05-13 14:28:12', tool: 'accounts.list',     client: 'Cursor',           inst: 'Itaú',   scope: 'accounts.read',     dur: 96,  decision: 'allowed', summary: 'Returned 3 accounts' },
    { t: '2026-05-13 14:27:03', tool: 'transactions.list', client: 'Custom MCP host',  inst: 'Itaú',   scope: 'transactions.read', dur: 0,   decision: 'denied',  reason: 'rate_limit',      summary: 'Client over per-minute quota (60/60)' },
    { t: '2026-05-13 14:26:48', tool: 'balances.get',      client: 'Claude Desktop',   inst: 'BTG',    scope: 'balances.read',     dur: 0,   decision: 'denied',  reason: 'consent_expired', summary: 'Consent for BTG expires in <7d — re-auth' },
    { t: '2026-05-13 14:25:11', tool: 'investments.list',  client: 'Internal CFO bot', inst: 'BTG',    scope: 'investments.read',  dur: 0,   decision: 'denied',  reason: 'scope_not_granted', summary: 'Client not granted investments.read' },
    { t: '2026-05-13 14:24:42', tool: 'transactions.list', client: 'Cursor',           inst: 'Nubank', scope: 'transactions.read', dur: 286, decision: 'allowed', summary: 'Returned 22 transactions' },
    { t: '2026-05-13 14:22:18', tool: 'accounts.list',     client: 'Claude Desktop',   inst: 'Inter',  scope: 'accounts.read',     dur: 174, decision: 'allowed', summary: 'Returned 1 account' },
    { t: '2026-05-13 14:21:05', tool: 'balances.get',      client: 'Cursor',           inst: 'Nubank', scope: 'balances.read',     dur: 142, decision: 'allowed', summary: 'Returned balances for 2 accounts' },
    { t: '2026-05-13 14:18:32', tool: 'cards.list',        client: 'Claude Desktop',   inst: 'Nubank', scope: 'cards.read',        dur: 198, decision: 'allowed', summary: 'Returned 2 cards' },
    { t: '2026-05-13 14:15:09', tool: 'transactions.list', client: 'Claude Desktop',   inst: 'Itaú',   scope: 'transactions.read', dur: 312, decision: 'allowed', summary: 'Returned 64 transactions (filtered)' },
    { t: '2026-05-13 14:12:51', tool: 'identity.get',      client: 'Cursor',           inst: 'Itaú',   scope: 'identity.read',     dur: 0,   decision: 'denied',  reason: 'scope_not_granted', summary: 'Client not granted identity.read' },
  ],
};
