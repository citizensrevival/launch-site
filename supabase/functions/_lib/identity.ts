// IP and User Agent parsing utilities

export function getClientIP(req: Request): string | null {
  // Check various headers for the real IP
  const forwardedFor = req.headers.get('X-Forwarded-For')
  const cfConnectingIP = req.headers.get('CF-Connecting-IP')
  const realIP = req.headers.get('X-Real-IP')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  
  return null
}

export function parseUserAgent(userAgent: string): {
  category: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown'
  browserName: string
  browserVersion?: string
  osName: string
  osVersion?: string
  isBot: boolean
} {
  const ua = userAgent.toLowerCase()
  
  // Bot detection
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'whatsapp', 'telegram'
  ]
  const isBot = botPatterns.some(pattern => ua.includes(pattern))
  
  if (isBot) {
    return {
      category: 'bot',
      browserName: 'Bot',
      osName: 'Unknown',
      isBot: true
    }
  }
  
  // Device category detection
  let category: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown'
  if (ua.includes('mobile') || ua.includes('android')) {
    category = 'mobile'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    category = 'tablet'
  } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    category = 'desktop'
  }
  
  // Browser detection
  let browserName = 'Unknown'
  let browserVersion: string | undefined
  
  if (ua.includes('chrome')) {
    browserName = 'Chrome'
    const match = ua.match(/chrome\/(\d+\.\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('firefox')) {
    browserName = 'Firefox'
    const match = ua.match(/firefox\/(\d+\.\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'Safari'
    const match = ua.match(/version\/(\d+\.\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('edge')) {
    browserName = 'Edge'
    const match = ua.match(/edg\/(\d+\.\d+)/)
    if (match) browserVersion = match[1]
  }
  
  // OS detection
  let osName = 'Unknown'
  let osVersion: string | undefined
  
  if (ua.includes('windows')) {
    osName = 'Windows'
    if (ua.includes('windows nt 10.0')) osVersion = '10'
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1'
    else if (ua.includes('windows nt 6.2')) osVersion = '8'
    else if (ua.includes('windows nt 6.1')) osVersion = '7'
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    osName = 'macOS'
    const match = ua.match(/mac os x (\d+[._]\d+)/)
    if (match) osVersion = match[1].replace('_', '.')
  } else if (ua.includes('linux')) {
    osName = 'Linux'
  } else if (ua.includes('android')) {
    osName = 'Android'
    const match = ua.match(/android (\d+\.\d+)/)
    if (match) osVersion = match[1]
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    osName = 'iOS'
    const match = ua.match(/os (\d+[._]\d+)/)
    if (match) osVersion = match[1].replace('_', '.')
  }
  
  return {
    category,
    browserName,
    browserVersion,
    osName,
    osVersion,
    isBot: false
  }
}

export function anonymizeIP(ip: string): string {
  // Simple IPv4 anonymization - zero out last octet
  const parts = ip.split('.')
  if (parts.length === 4) {
    parts[3] = '0'
    return parts.join('.')
  }
  return ip
}
