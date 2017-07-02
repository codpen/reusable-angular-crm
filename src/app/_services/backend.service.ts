import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { User } from '../_models';

@Injectable()
export class BackendService {

    private baseUrl: string = "http://localhost:5354/";

    constructor(private http: Http, private location: Location) {
        console.log(http);
        this.location.prepareExternalUrl(this.baseUrl);

    }

    getAll(action: string) {
        return this.http.get(this.baseUrl + action, this.jwt()).map((response: Response) => response.json());
    }

    getById(action: string, id: number) {
        let url = `${this.baseUrl}${action}/${id}`
        return this.http.get(url, this.jwt()).map((response: Response) => response.json());
    }

    create(action: string, data: any) {
        return this.http.post(this.baseUrl + action, data, this.jwt()).map((response: Response) => response.json());
    }

    update(action: string, data: any) {
        let url = `${this.baseUrl}${action}/${data.id}`
        return this.http.put(url, data, this.jwt()).map((response: Response) => response.json());
    }

    delete(action: string, id: number) {
        let url = `${this.baseUrl}${action}/${id}`
        return this.http.delete(url, this.jwt()).map((response: Response) => response.json());
    }

    login(action: string, user: User) {
        // this.http.get("http://localhost:5354/token").do()

        return this.http.get(this.baseUrl + action).map((response: Response) => response.json());
    }

    // private helper methods
    private form() {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        return new RequestOptions({ headers: headers });
    }

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
}