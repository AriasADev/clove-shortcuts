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
        }
    }

    private isSessionValid(): boolean {
        const sessionCookie = this.cookieJar.getCookie('ory_kratos_session');
        if (!sessionCookie) return false;
        return true; // Simplified check - in production you'd want to check expiry
    }

    private async login(): Promise<void> {
        console.log('[Hytale] Initializing login flow...');
        
        // Step 1: Initialize login flow
        const initResponse = await axios.get(
            'https://backend.accounts.hytale.com/self-service/login/browser',
            { maxRedirects: 0, validateStatus: (status) => status === 302 }
        );

        const location = initResponse.headers.location;
        const flowMatch = location?.match(/flow=([a-f0-9-]+)/);
        if (!flowMatch) {
            throw new Error('Could not extract flow ID from Hytale login');
        }
        const flowId = flowMatch[1];

        // Store cookies from init
        const setCookieHeaders = initResponse.headers['set-cookie'] || [];
        this.cookieJar.parseCookies(setCookieHeaders);

        const csrfToken = this.cookieJar.getCookie('csrf_token');
        if (!csrfToken) {
            throw new Error('Could not find CSRF token cookie');
        }

        console.log('[Hytale] Submitting login...');

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
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': this.cookieJar.getCookieString()
                },
                maxRedirects: 0,
                validateStatus: (status) => status === 303
            }
        );

        // Store session cookies
        const loginCookies = loginResponse.headers['set-cookie'] || [];
        this.cookieJar.parseCookies(loginCookies);

        const redirectLocation = loginResponse.headers.location;
        if (!redirectLocation?.includes('/settings')) {
            throw new Error('Login failed - unexpected redirect');
        }

        // Step 3: Follow redirect to complete login
        await axios.get(redirectLocation, {
            headers: { 'Cookie': this.cookieJar.getCookieString() }
        });

        console.log('[Hytale] Login successful!');
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

        const response = await axios.get(
            `https://accounts.hytale.com/api/account/username-reservations/availability`,
            {
                params: { username },
                headers: { 'Cookie': this.cookieJar.getCookieString() },
                validateStatus: (status) => status === 200 || status === 400
            }
        );

        // 400 = available, 200 = taken
        return response.status === 400;
    }
}

// Export singleton instance
export const hytaleAPI = new HytaleAPIClient();