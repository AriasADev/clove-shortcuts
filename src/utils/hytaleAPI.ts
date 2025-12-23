import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Simple cookie jar for session management
 */
class SimpleCookieJar {
    private cookies: Map<string, { value: string; expires?: Date }> = new Map();

    setCookie(name: string, value: string, expires?: Date): void {
        this.cookies.set(name, { value, expires });
    }

    getCookie(name: string): string | null {
        const cookie = this.cookies.get(name);
        if (!cookie) return null;
        
        if (cookie.expires && new Date() > cookie.expires) {
            this.cookies.delete(name);
            return null;
        }
        
        return cookie.value;
    }

    getCookieString(): string {
        const validCookies: string[] = [];
        for (const [name, cookie] of this.cookies.entries()) {
            if (!cookie.expires || new Date() < cookie.expires) {
                validCookies.push(`${name}=${cookie.value}`);
            }
        }
        return validCookies.join('; ');
    }

    parseCookies(setCookieHeaders: string[]): void {
        for (const header of setCookieHeaders) {
            const parts = header.split(';');
            const [nameValue] = parts;
            const [name, value] = nameValue.split('=');
            
            let expires: Date | undefined;
            for (const part of parts.slice(1)) {
                const trimmed = part.trim();
                if (trimmed.toLowerCase().startsWith('expires=')) {
                    const dateStr = trimmed.substring(8);
                    expires = new Date(dateStr);
                }
            }
            
            this.setCookie(name.trim(), value.trim(), expires);
        }
    }
}

/**
 * Hytale API Client with authentication
 */
class HytaleAPIClient {
    private cookieJar = new SimpleCookieJar();
    private credentials = {
        identifier: process.env.HYTALE_EMAIL || '',
        password: process.env.HYTALE_PASSWORD || ''
    };

    constructor() {
        if (!this.credentials.identifier || !this.credentials.password) {
            console.warn('WARNING: HYTALE_EMAIL or HYTALE_PASSWORD not set in .env file!');
            console.warn('The Hytale username checker will not work without authentication.');
        } else {
            console.log('[Hytale] Credentials loaded successfully');
            console.log('[Hytale] Email:', this.credentials.identifier);
            console.log('[Hytale] Password length:', this.credentials.password.length);
        }
    }

    private isSessionValid(): boolean {
        const sessionCookie = this.cookieJar.getCookie('ory_kratos_session');
        if (!sessionCookie) return false;
        return true; // Simplified check - in production you'd want to check expiry
    }

    private async login(): Promise<void> {
        try {
            console.log('[Hytale] Initializing login flow...');
            
            // Proper browser headers to avoid Cloudflare blocking
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            };
            
            // Step 1: Initialize login flow
            const initResponse = await axios.get(
                'https://backend.accounts.hytale.com/self-service/login/browser',
                { 
                    headers,
                    maxRedirects: 0, 
                    validateStatus: (status) => status === 302 || status === 303 
                }
            );

            const location = initResponse.headers.location;
            console.log('[Hytale] Init redirect location:', location);
            
            const flowMatch = location?.match(/flow=([a-f0-9-]+)/);
            if (!flowMatch) {
                console.error('[Hytale] Failed to extract flow ID from location:', location);
                throw new Error('Could not extract flow ID from Hytale login');
            }
            const flowId = flowMatch[1];
            console.log('[Hytale] Flow ID:', flowId);

            // Follow the redirect to get the login page and more cookies
            console.log('[Hytale] Following redirect to login page...');
            const loginPageResponse = await axios.get(location, {
                headers: {
                    ...headers,
                    'Cookie': this.cookieJar.getCookieString()
                },
                maxRedirects: 0,
                validateStatus: () => true // Accept any status
            });

            // Store any additional cookies from the login page
            const loginPageCookies = loginPageResponse.headers['set-cookie'] || [];
            this.cookieJar.parseCookies(loginPageCookies);
            console.log('[Hytale] Stored', loginPageCookies.length, 'additional cookies from login page');

            // Store cookies from init
            const setCookieHeaders = initResponse.headers['set-cookie'] || [];
            this.cookieJar.parseCookies(setCookieHeaders);
            console.log('[Hytale] Stored', setCookieHeaders.length, 'cookies from init');

            // Find CSRF token cookie (it has a hash suffix like csrf_token_xxxxx)
            let csrfToken: string | null = null;
            for (const [cookieName, cookie] of this.cookieJar['cookies'].entries()) {
                if (cookieName.startsWith('csrf_token')) {
                    csrfToken = cookie.value;
                    console.log('[Hytale] Found CSRF token cookie:', cookieName);
                    break;
                }
            }

            if (!csrfToken) {
                console.error('[Hytale] CSRF token not found! Available cookies:', Array.from(this.cookieJar['cookies'].keys()));
                throw new Error('Could not find CSRF token cookie');
            }
            console.log('[Hytale] CSRF token extracted');

            console.log('[Hytale] Submitting login credentials...');

            // Step 2: Submit login credentials
            const loginResponse = await axios.post(
                `https://backend.accounts.hytale.com/self-service/login?flow=${flowId}`,
                new URLSearchParams({
                    csrf_token: csrfToken,
                    identifier: this.credentials.identifier,
                    password: this.credentials.password,
                    method: 'password'
                }),
                {
                    headers: {
                        ...headers,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': this.cookieJar.getCookieString(),
                        'Origin': 'https://accounts.hytale.com',
                        'Referer': `https://accounts.hytale.com/login?flow=${flowId}`
                    },
                    maxRedirects: 0,
                    validateStatus: (status) => status >= 200 && status < 400
                }
            );

            console.log('[Hytale] Login response status:', loginResponse.status);

            // Check for error response
            if (loginResponse.status !== 303 && loginResponse.status !== 302) {
                console.error('[Hytale] Unexpected status code:', loginResponse.status);
                console.error('[Hytale] Response data:', JSON.stringify(loginResponse.data).substring(0, 500));
                throw new Error(`Login failed with status ${loginResponse.status}`);
            }

            // Store session cookies
            const loginCookies = loginResponse.headers['set-cookie'] || [];
            this.cookieJar.parseCookies(loginCookies);
            console.log('[Hytale] Stored', loginCookies.length, 'session cookies');

            const redirectLocation = loginResponse.headers.location;
            console.log('[Hytale] Login redirect location:', redirectLocation);
            
            if (!redirectLocation) {
                throw new Error('Login failed - no redirect location');
            }

            // Check if we got an error redirect
            if (redirectLocation.includes('/error')) {
                console.error('[Hytale] Login failed - redirected to error page');
                
                // Fetch the error page to see what went wrong
                try {
                    const errorResponse = await axios.get(redirectLocation, {
                        headers: { 
                            ...headers,
                            'Cookie': this.cookieJar.getCookieString()
                        }
                    });
                    
                    // Try to extract error message from the HTML
                    const errorHtml = errorResponse.data;
                    console.log('[Hytale] Error page HTML snippet:', errorHtml.substring(0, 1000));
                    
                    // Look for common error patterns
                    const patterns = [
                        /<div[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/div>/is,
                        /<p[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/p>/is,
                        /<span[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/span>/is,
                        /error[^<]*:\s*([^<]+)</i
                    ];
                    
                    for (const pattern of patterns) {
                        const match = errorHtml.match(pattern);
                        if (match) {
                            const errorMsg = match[1].replace(/<[^>]*>/g, '').trim();
                            console.error('[Hytale] Error message found:', errorMsg);
                            break;
                        }
                    }
                } catch (e) {
                    console.error('[Hytale] Could not fetch error page details:', e instanceof Error ? e.message : e);
                }
                
                throw new Error('Login failed - check your HYTALE_EMAIL and HYTALE_PASSWORD in .env file. The credentials may be incorrect, or 2FA may be enabled on your account.');
            }

            if (!redirectLocation.includes('/settings')) {
                console.error('[Hytale] Unexpected redirect - might indicate login failure');
                console.error('[Hytale] Expected /settings, got:', redirectLocation);
                throw new Error('Login failed - invalid credentials or unexpected redirect');
            }

            // Step 3: Follow redirect to complete login
            const finalResponse = await axios.get(redirectLocation, {
                headers: { 
                    ...headers,
                    'Cookie': this.cookieJar.getCookieString(),
                    'Referer': 'https://backend.accounts.hytale.com/'
                },
                maxRedirects: 5
            });

            console.log('[Hytale] Final response status:', finalResponse.status);

            // Verify we have a session cookie
            const sessionCookie = this.cookieJar.getCookie('ory_kratos_session');
            if (!sessionCookie) {
                console.error('[Hytale] No session cookie found after login!');
                throw new Error('Login appeared successful but no session cookie was set');
            }

            console.log('[Hytale] Login successful! Session cookie acquired.');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('[Hytale] Axios error during login:');
                console.error('  Status:', error.response?.status);
                console.error('  Message:', error.message);
                console.error('  Response:', JSON.stringify(error.response?.data).substring(0, 500));
                throw new Error(`Hytale login failed: ${error.message}`);
            }
            console.error('[Hytale] Non-axios error during login:', error);
            throw error;
        }
    }

    private async ensureLoggedIn(): Promise<void> {
        if (this.isSessionValid()) return;

        console.log('[Hytale] Session expired or not logged in, logging in...');
        await this.login();
    }

    /**
     * Check if a Hytale username is available
     * @returns true if available, false if taken
     */
    async checkUsername(username: string): Promise<boolean> {
        await this.ensureLoggedIn();

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://hytale.com/',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Cookie': this.cookieJar.getCookieString()
        };

        const response = await axios.get(
            `https://accounts.hytale.com/api/account/username-reservations/availability`,
            {
                params: { username },
                headers,
                validateStatus: (status) => status === 200 || status === 400
            }
        );

        // 400 = available, 200 = taken
        return response.status === 400;
    }
}

// Export singleton instance
export const hytaleAPI = new HytaleAPIClient();