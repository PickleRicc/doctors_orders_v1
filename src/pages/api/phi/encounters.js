export default function handler(req, res) {
  // Temporarily return mock data to test if the route works
  return res.status(200).json({
    success: true,
    encounters: [
      {
        id: '1',
        template_type: 'knee',
        session_title: 'Test Session',
        status: 'draft',
        created_at: new Date().toISOString()
      }
    ],
    count: 1,
    message: 'Mock data - database connection temporarily disabled for testing'
  });
}
