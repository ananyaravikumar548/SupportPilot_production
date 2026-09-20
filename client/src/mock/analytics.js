export const mockAnalytics = {
  systemOverview: {
    totalCustomers: '1,248',
    totalAgents: '32',
    totalTickets: '2,856',
    resolvedTickets: '2,356',
  },
  ticketsByCategory: [
    { name: 'Billing', value: 35, color: '#3B82F6' },
    { name: 'Technical', value: 30, color: '#8B5CF6' },
    { name: 'Account', value: 20, color: '#F59E0B' },
    { name: 'General', value: 15, color: '#10B981' },
  ],
  ticketsTrend: [
    { date: '21 May', tickets: 280 },
    { date: '22 May', tickets: 420 },
    { date: '23 May', tickets: 550 },
    { date: '24 May', tickets: 490 },
    { date: '25 May', tickets: 630 },
    { date: '26 May', tickets: 520 },
    { date: '27 May', tickets: 710 },
  ],
  ticketsByPriority: [
    { priority: 'High', count: 892, color: '#EF4444' },
    { priority: 'Medium', count: 1256, color: '#F59E0B' },
    { priority: 'Low', count: 708, color: '#10B981' },
  ],
  topAgents: [
    { rank: 1, name: 'James Wilson', resolved: 256 },
    { rank: 2, name: 'Emily Davis', resolved: 198 },
    { rank: 3, name: 'David Brown', resolved: 182 },
    { rank: 4, name: 'Lisa Anderson', resolved: 164 },
    { rank: 5, name: 'Michael Clark', resolved: 142 },
  ],
  recentSlaBreaches: [
    { id: '#TKT-1023', time: '2h ago' },
    { id: '#TKT-1021', time: '3h ago' },
    { id: '#TKT-1018', time: '5h ago' },
    { id: '#TKT-1012', time: '6h ago' },
    { id: '#TKT-1009', time: '7h ago' },
  ],
  aiEngineStats: {
    totalPredictions: '12,842',
    accuracy: '91.6%',
    modelVersion: 'v1.3.2',
    lastTrained: '26 May 2024',
  }
};