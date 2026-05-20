import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'q02_token';
const USER_KEY = 'q02_user';

export interface StoredUser {
  user_id: number;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<StoredUser | null>(this.loadUser());

  setSession(token: string, user: StoredUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.user.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  private loadUser(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  }
}
