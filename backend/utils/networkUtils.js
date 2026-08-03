const ipaddr = require('ipaddr.js');

/**
 * Checks if a given client IP matches any of the allowed networks.
 * Handles both IPv4 and IPv6, as well as single IPs and CIDR subnets.
 * 
 * @param {string} clientIpStr - The IP address of the client.
 * @param {string} allowedNetworksCsv - Comma-separated list of IPs or CIDR blocks.
 * @returns {boolean} - True if allowed, false otherwise.
 */
function isAllowedNetwork(clientIpStr, allowedNetworksCsv) {
  if (!allowedNetworksCsv) {
    return true; 
  }

  try {
    const cleanIpStr = clientIpStr.split(',')[0].trim();
    
    // Parse the client IP, and if it's an IPv4-mapped IPv6 address (like ::ffff:15.20.21.64), convert it back to pure IPv4
    let clientIp = ipaddr.process(cleanIpStr);
    if (clientIp.kind() === 'ipv6' && clientIp.isIPv4MappedAddress()) {
      clientIp = clientIp.toIPv4Address();
    }
    const networks = allowedNetworksCsv.split(',').map(n => n.trim()).filter(n => n);

    for (const network of networks) {
      if (network.includes('/')) {
        // CIDR subnet matching (e.g. 192.168.1.0/24)
        const parsed = ipaddr.parseCIDR(network);
        if (clientIp.kind() === parsed[0].kind() && clientIp.match(parsed)) {
          return true;
        }
      } else {
        // Exact single IP matching (e.g. 103.52.37.46)
        const parsed = ipaddr.process(network);
        if (clientIp.kind() === parsed.kind() && clientIp.toString() === parsed.toString()) {
          return true;
        }
      }
    }
  } catch (e) {
    console.error('[Network Verification Error] IP parsing failed:', e.message);
  }
  
  return false;
}

module.exports = { isAllowedNetwork };
