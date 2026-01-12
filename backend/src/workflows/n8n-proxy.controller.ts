import {
  Controller,
  All,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

/**
 * Proxy controller to forward requests to n8n
 * This allows embedding n8n in the frontend with authentication
 * 
 * CRITICAL: JavaScript files are NEVER modified - only HTML gets path rewriting
 */
@Controller('n8n-proxy')
export class N8nProxyController {
  private readonly n8nUrl: string;
  private readonly n8nAuth: { user: string; pass: string };

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.n8nUrl =
      this.configService.get<string>('N8N_URL') || 'http://n8n:5678';
    this.n8nAuth = {
      user: this.configService.get<string>('N8N_BASIC_AUTH_USER') || 'admin',
      pass:
        this.configService.get<string>('N8N_BASIC_AUTH_PASSWORD') ||
        'n8n_admin_pass',
    };
  }

  /**
   * Handle root path
   */
  @All()
  async proxyRoot(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('authorization') authHeader?: string,
  ) {
    return this.proxyAll(req, res, authHeader);
  }

  /**
   * Proxy all requests to n8n
   * Authentication is optional - if JWT provided, validate it
   */
  @All('*path')
  async proxyAll(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('authorization') authHeader?: string,
  ) {
    // Optional: Validate JWT if provided
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        this.jwtService.verify(token);
      } catch (error) {
        // Invalid token - still proxy (n8n has its own basic auth)
      }
    }

    try {
      // Get the path - nginx strips /api/ prefix, so req.url will be /n8n-proxy/...
      // req.originalUrl might have /api/ prefix
      let proxyPath = req.originalUrl || req.url;
      
      // Debug: log the original paths
      console.log(`[n8n-proxy] req.url: ${req.url}, req.originalUrl: ${req.originalUrl}`);
      
      // Remove /api/n8n-proxy or /n8n-proxy prefix
      if (proxyPath.startsWith('/api/n8n-proxy')) {
        proxyPath = proxyPath.replace('/api/n8n-proxy', '');
      } else if (proxyPath.startsWith('/n8n-proxy')) {
        proxyPath = proxyPath.replace('/n8n-proxy', '');
      }
      
      // Ensure path starts with /
      if (!proxyPath || proxyPath === '') {
        proxyPath = '/';
      } else if (!proxyPath.startsWith('/')) {
        proxyPath = '/' + proxyPath;
      }
      
      const targetUrl = `${this.n8nUrl}${proxyPath}`;
      console.log(`[n8n-proxy] Proxying: ${req.method} ${proxyPath} -> ${targetUrl}`);
      
      // Prepare headers
      const headers: Record<string, string> = {};
      Object.keys(req.headers).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (!['host', 'connection', 'content-length'].includes(lowerKey)) {
          const value = req.headers[key];
          if (typeof value === 'string') {
            headers[key] = value;
          } else if (Array.isArray(value) && value.length > 0) {
            headers[key] = value[0];
          }
        }
      });

      // Forward cookies from browser to n8n
      if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
      }

      // Add n8n basic auth
      if (this.n8nAuth.user && this.n8nAuth.pass) {
        const auth = Buffer.from(
          `${this.n8nAuth.user}:${this.n8nAuth.pass}`,
        ).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
      }

      // Get request body
      let body: string | undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
        if (req.body) {
          body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }
      }

      // Forward the request
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body,
      });

      // Get content type
      const contentType = response.headers.get('content-type') || '';
      const isJavaScript = proxyPath.endsWith('.js');
      
      // Forward response headers (remove problematic ones)
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (
          ![
            'content-encoding',
            'transfer-encoding',
            'content-length',
            'connection',
            'x-frame-options',
            'content-security-policy',
          ].includes(lowerKey)
        ) {
          // Forward Set-Cookie headers to establish session
          if (lowerKey === 'set-cookie') {
            // Set-Cookie can be an array, handle it properly
            const cookieValues = response.headers.getSetCookie 
              ? response.headers.getSetCookie()
              : [value];
            cookieValues.forEach((cookie: string) => {
              res.appendHeader('Set-Cookie', cookie);
            });
          } else {
            res.setHeader(key, value);
          }
        }
      });

      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('x-frame-options');
      
      // Disable caching for HTML to ensure fresh content
      if (contentType.includes('text/html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      // Set proper Content-Type for JS files
      if (isJavaScript) {
        if (!contentType.includes('javascript')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        // Add cache-busting headers for JavaScript to prevent stale cache
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      res.status(response.status);

      // Handle binary files
      if (
        contentType.includes('image/') ||
        contentType.includes('font/') ||
        contentType.includes('application/octet-stream')
      ) {
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
        return;
      }

      // Get response text
      const text = await response.text();
      
      // CRITICAL: Check for base-path.js FIRST before generic JavaScript handling
      if (proxyPath === '/static/base-path.js' || proxyPath.endsWith('/static/base-path.js')) {
        // Only rewrite BASE_PATH in base-path.js, nothing else
        const rewritten = text.replace(
          /window\.BASE_PATH\s*=\s*['"]\/['"]/g,
          'window.BASE_PATH = "/api/n8n-proxy/"'
        );
        res.send(rewritten);
        return;
      }
      
      // Double-check: If path ends with .js, it MUST be JavaScript, never rewrite
      if (isJavaScript) {
        // This is a JavaScript file - pass through completely unchanged
        // Even if it looks like HTML (error page), don't touch it
        res.send(text);
        return;
      }
      
      const isHTML = text.trim().startsWith('<!');

      // CRITICAL: Only rewrite HTML, NEVER touch JavaScript
      if (isHTML) {
        // Rewrite absolute paths in HTML attributes and CSS only
        // DO NOT use broad regex that could match JavaScript string literals!
        const cacheBuster = Date.now();
        const rewritten = text
          // Match src=" and href=" attributes - add cache busting to JS files
          .replace(/(src|href)=["']\/(static|assets)\/([^"']+\.js)(["'])/g, (match, attr, dir, file, quote) => {
            return `${attr}="/api/n8n-proxy/${dir}/${file}?v=${cacheBuster}${quote}`;
          })
          // Match other src=" and href=" attributes (non-JS files)
          .replace(/(src|href)=["']\/(static|assets)\//g, '$1="/api/n8n-proxy/$2/')
          // Match url() in CSS
          .replace(/url\(["']?\/(static|assets)\//g, 'url("/api/n8n-proxy/$1/')
          // Match @font-face url() specifically
          .replace(/(@font-face[^}]*url\(["']?)\/(static|assets)\//g, '$1/api/n8n-proxy/$2/');
        res.send(rewritten);
      } else {
        // All other files pass through unchanged
        res.send(text);
      }
    } catch (error) {
      console.error('n8n proxy error:', error);
      res.status(500).json({
        error: 'Failed to proxy request to n8n',
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

}
