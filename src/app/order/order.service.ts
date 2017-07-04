import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { BackendService } from '../_services'
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

import { IOrder } from './order';

@Injectable()
export class OrderService {
    private baseUrl = 'orders';

    constructor(private http: Http, private backend: BackendService) { }

    getOrders(): Observable<IOrder[]> {
        // return this.http.get(this.baseUrl)
        const url = `${this.baseUrl}?_expand=customer`;
        return this.backend.getAll(url)
            .map(this.extractData)
            // .do(data => console.log('getOrders: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }

    getOrder(id: number): Observable<IOrder> {
        if (id === 0) {
            return Observable.of(this.initializeOrder());
            // return Observable.create((observer: any) => {
            //     observer.next(this.initializeOrder());
            //     observer.complete();
            // });
        };
        const url = `${this.baseUrl}/${id}/?_expand=customer`;
        return this.backend.getById( url, id)
            .map(this.extractData)
            .do(data => console.log('getOrder: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }

    deleteOrder(id: number): Observable<Response> {
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });

        const url = `${this.baseUrl}/${id}`;
        return this.backend.delete(url, id)
            // .do(data => console.log('deleteOrder: ' + JSON.stringify(data)))
            .catch(this.handleError);
    }

    saveOrder(order: IOrder): Observable<IOrder> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });

        if (order.id === 0) {
            return this.createOrder(order, options);
        }
        return this.updateOrder(order, options);
    }

    private createOrder(order: IOrder, options: RequestOptions): Observable<IOrder> {
        order.id = undefined;
        return this.backend.create(this.baseUrl, order)
            .map(this.extractData)
            .catch(this.handleError);
    }

    private updateOrder(order: IOrder, options: RequestOptions): Observable<IOrder> {
        // const url = `orders/${order.id}`;
        return this.backend.update(this.baseUrl, order)
            .map(() => order)
            .catch(this.handleError);
    }

    private extractData(response: Response) {
        let body = response.json ? response.json() : response;
        return body.data ? body.data : (body || {});
    }

    private handleError(error: Response): Observable<any> {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }

    initializeOrder(): IOrder {
        // Return an initialized object
        return {
            id: 0,
            avatar: null,
            product: null,
            price: 0,
            customerId: 0,
            quantity: 0,
            isActive: false,
            customer: null,
        };
    }
}
