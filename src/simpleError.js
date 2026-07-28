const simpleError = (err) => {
  const msg = err?.message || '';

  // --- DNS / connectivity ---
  if (msg.includes('ERR_NAME_NOT_RESOLVED')) {
    return "Domain not found. Check that the URL is correct.";
  }
  if (msg.includes('ERR_CONNECTION_REFUSED')) {
    return "Connection refused. The site may be down.";
  }
  if (msg.includes('ERR_CONNECTION_RESET') || msg.includes('ERR_CONNECTION_CLOSED')) {
    return "Connection interrupted while loading the page.";
  }
  if (msg.includes('ERR_CONNECTION_TIMED_OUT') || msg.includes('ERR_TIMED_OUT')) {
    return "Connection timed out.";
  }
  if (msg.includes('ERR_ADDRESS_UNREACHABLE')) {
    return "Address unreachable.";
  }
  if (msg.includes('ERR_INTERNET_DISCONNECTED')) {
    return "Network unavailable. Try again shortly.";
  }
  if (msg.includes('ERR_EMPTY_RESPONSE')) {
    return "Site closed the connection without sending a response.";
  }

  // --- SSL / certificates ---
  if (msg.includes('ERR_CERT') || msg.includes('ERR_SSL') || msg.includes('SSL')) {
    return "SSL/certificate error on that site.";
  }

  // --- Redirects / blocking ---
  if (msg.includes('ERR_TOO_MANY_REDIRECTS')) {
    return "Too many redirects — the page never settled.";
  }
  if (msg.includes('ERR_BLOCKED_BY_CLIENT') || msg.includes('ERR_BLOCKED_BY_RESPONSE')) {
    return "Page content blocked; unable to load.";
  }

  // --- Local / file errors ---
  if (msg.includes('ERR_FILE_NOT_FOUND')) {
    return "Requested file or resource not found.";
  }
  if (msg.includes('ERR_INVALID_URL') || msg.includes('Invalid URL')) {
    return "Invalid URL. Must start with http:// or https://.";
  }

  // --- Timeouts / navigation ---
  if (msg.includes('Navigation timeout') || msg.includes('TimeoutError') || msg.includes('exceeded')) {
    return "Page load timed out.";
  }
  if (msg.includes('ERR_ABORTED')) {
    return "Page load aborted before completion.";
  }

  // --- Puppeteer / browser process issues ---
  if (msg.includes('Target closed') || msg.includes('Session closed')) {
    return "Browser closed unexpectedly during page load.";
  }
  if (msg.includes('Protocol error')) {
    return "Internal browser communication error. Try again.";
  }
  if (msg.includes('Failed to launch') || msg.includes('spawn')) {
    return "Browser service failed to start. Try again shortly.";
  }

  // --- HTTP status codes (thrown manually as HTTP_<status> in scraper.js) ---
  if (msg.startsWith('HTTP_')) {
    const status = msg.split('_')[1];
    if (status?.startsWith('4')) {
      return `Page returned ${status}: not found or access denied.`;
    }
    if (status?.startsWith('5')) {
      return `Site returned a server error (${status}). Try again later.`;
    }
    return `Site returned an unexpected status (${status}).`;
  }

  if (msg.startsWith('URL')) {
      return 'URL is not supported, please try another.';
  }

  // --- Fallback ---
  return "Request failed. Try a different URL.";
};

module.exports = { simpleError };
