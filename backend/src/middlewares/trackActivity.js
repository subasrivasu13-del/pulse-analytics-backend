const jwt = require('jsonwebtoken');
const Analytics = require('../models/Analytics');

module.exports = async (req, res, next) => {
  const path = req.originalUrl || req.path;

  // Avoid logging auth, analytics, and static asset routes to prevent circular logs or clutter
  if (
    path.includes('/analytics') || 
    path.includes('/auth') || 
    path.includes('/favicon.ico') ||
    path.includes('/static')
  ) {
    return next();
  }

  // Retrieve userId from JWT token if present in Authorization header
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_12345');
      userId = decoded.id || null;
    } catch (err) {
      // Ignore token verify error here; session remains anonymous or unlinked
    }
  }

  // Capture session ID, IP address and request path
  const sessionId = req.headers['x-session-id'] || 'unknown_session';
  
  // Parse IP address properly
  let ipAddress = req.headers['x-forwarded-for'] || req.ip || (req.socket ? req.socket.remoteAddress : '') || '127.0.0.1';
  if (ipAddress.includes('::ffff:')) {
    ipAddress = ipAddress.split('::ffff:')[1];
  }

  // Register finish listener to save log without delaying the HTTP response
  res.on('finish', async () => {
    try {
      await Analytics.create({
        userId,
        route: path,
        sessionId,
        ipAddress,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  });

  next();
};
