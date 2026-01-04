/**
 * Rate Limiting Middleware for Next.js API Routes
 * SECURITY: Prevents abuse and DoS attacks
 * No external dependencies - pure Next.js implementation
 */

// Store for rate limit tracking (in-memory, use Redis in production)
const requests = new Map();

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  
  for (const [key, timestamps] of requests.entries()) {
    const recentTimestamps = timestamps.filter(time => time > oneHourAgo);
    if (recentTimestamps.length === 0) {
      requests.delete(key);
    } else {
      requests.set(key, recentTimestamps);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => {
      // Get client IP from various headers (Vercel, Cloudflare, etc.)
      return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.socket?.remoteAddress ||
             'unknown';
    }
  } = options;

  return async (req, res, handler) => {
    // Skip rate limiting if disabled
    if (process.env.ENABLE_RATE_LIMITING !== 'true') {
      return handler(req, res);
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this key
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const requestLog = requests.get(key);
    
    // Remove old requests outside window
    const recentRequests = requestLog.filter(time => time > windowStart);
    requests.set(key, recentRequests);

    // Check if limit exceeded
    if (recentRequests.length >= max) {
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(recentRequests[0] + windowMs).toISOString());
      
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    // Set headers
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(max - recentRequests.length));
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    // Call the actual handler
    return handler(req, res);
  };
}

// Preset rate limiters for different endpoint types
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many API requests, please try again later'
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later'
});

export const phiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many PHI requests, please slow down'
});

export const transcriptionRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Transcription limit reached, please try again later'
});

