import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { UsersService } from './users.service';
import { WSService } from './ws.service';

@Injectable({ providedIn: 'root' })
export class UserAuthService {
  private endpoint = environment.endpoint;

  public get loggedIn() {
    const expired = new JwtHelperService().isTokenExpired(this.key);
    return this.usersService.self && !expired;
  }
  public get key() {
    return localStorage.getItem('key');
  }

  public get headers() {
    return { headers: { 'Authorization': `Bearer ${this.key}` } };
  }

  constructor(
    private http: HttpClient,
    private usersService: UsersService,
    private ws: WSService,
  ) {}

  public async signUp(user: Credentials) {
    const res: any = await this.http.post(`${this.endpoint}/users`, user).toPromise();

    if (res) {
      localStorage.setItem('key', res);
      await this.usersService.updateSelf();
    }
    return Boolean(res);
  }

  public async login(user: Credentials) {
    const res: string | { verify: true } = await this.http
      .post(`${this.endpoint}/login`, user)
      .toPromise() as any;      

    if (typeof res !== 'string')
      return res;

    localStorage.setItem('key', res);
    await this.usersService.init();
  }

  public async verify(code: string): Promise<string> {
    const res: string | { message: string } = await this.http
      .get(`${this.endpoint}/verify-code?code=${code}`)
      .toPromise() as any;
    if (typeof res !== 'string')
      throw res.message;
    return res;
  }

  public async sendVerifyEmail(email: string): Promise<boolean> {
    const res = await this.http.get(`${this.endpoint}/send-verify-email?email=${email}`, this.headers).toPromise() as any;
    return 'verify' in res;
  }

  public async changePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const res = await this.http
      .post(`${this.endpoint}/change-password`, {
        email,
        oldPassword,
        newPassword,
      }, this.headers)
      .toPromise() as any;

    localStorage.setItem('key', res);
    return true;
  }

  public ready() {
    return this.ws.emitAsync('READY', { key: localStorage.getItem('key') }, this);
  }
}

export interface Credentials {
  username?: string;
  email?: string;
  password: string;
}
