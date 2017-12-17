import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  ElementRef
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  FormControlName
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import "rxjs/add/operator/debounceTime";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import { IOrder } from "./order";
import { OrderService } from "./order.service";

import { NumberValidators } from "../shared/number.validator";
import { GenericValidator } from "../shared/generic-validator";
import { CustomerService, ICustomer } from "../customer";
import { MdDialog, MdDialogRef, MdSnackBar } from "@angular/material";
import { ProductDialogComponent } from "./product-dialog.component";

@Component({
  templateUrl: "./order-edit.component.html",
  styles: [
    `
    .example-section {
        display: flex;
        align-content: center;
        align-items: center;
        height: 60px;
        }

        .example-margin {
        margin: 0 10px;
        }
    `
  ],
  providers: [ProductDialogComponent]
})
export class OrderEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements: ElementRef[];
  // @ViewChild('mydp') mydp: MyDatePicker;

  pageTitle: string = "Order Edit";
  errorMessage: string;
  orderForm: FormGroup;

  order: IOrder;
  private sub: Subscription;
  showImage: boolean;
  customers: ICustomer[];

  // Use with the generic validation messcustomerId class
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private customerService: CustomerService,
    public dialog: MdDialog,
    public snackBar: MdSnackBar
  ) {
    // Defines all of the validation messcustomerIds for the form.
    // These could instead be retrieved from a file or database.
    this.validationMessages = {
      reference: {
        required: "Order reference is required.",
        minlength: "Order reference must be at least one characters.",
        maxlength: "Order reference cannot exceed 100 characters."
      },
      amount: {
        range:
          "Amount of the order must be between 1 (lowest) and 9999 (highest)."
      },
      quantity: {
        range:
          "Quantity of the order must be between 1 (lowest) and 20 (highest)."
      },
      customerId: {
        required: "Customer is required."
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      reference: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],
      amount: ["", NumberValidators.range(1, 99999)],
      quantity: ["", NumberValidators.range(1, 20)],
      orderDate: [""],
      shippedDate: [""],
      address: ["", [Validators.required]],
      city: ["", [Validators.required]],
      country: ["", [Validators.required]],
      zipcode: ["", [Validators.required]],
      customerId: ["", Validators.required],
      products: this.fb.array([]),
      isActive: false
    });

    // Read the order Id from the route parameter
    this.sub = this.route.params.subscribe(params => {
      let id = +params["id"];
      this.getOrder(id);
    });

    this.getCustomers();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    let controlBlurs: Observable<
      any
    >[] = this.formInputElements.map((formControl: ElementRef) =>
      Observable.fromEvent(formControl.nativeElement, "blur")
    );

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.orderForm.valueChanges, ...controlBlurs)
      .debounceTime(800)
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(
          this.orderForm
        );
      });
  }

  getOrder(id: number): void {
    this.orderService
      .getOrder(id)
      .subscribe(
        (order: IOrder) => this.onOrderRetrieved(order),
        (error: any) => (this.errorMessage = <any>error)
      );
  }

  getCustomers() {
    this.customerService.getCustomers().subscribe(customers => {
      this.customers = customers;
    }, error => (this.errorMessage = <any>error));
  }

  onOrderRetrieved(order: IOrder): void {
    if (this.orderForm) {
      this.orderForm.reset();
    }
    this.order = order;

    if (this.order.id === 0) {
      this.pageTitle = "Add Order";
    } else {
      this.pageTitle = `Edit Order: ${this.order.reference} ${this.order
        .amount}`;
    }

    // Update the data on the form
    this.orderForm.patchValue({
      reference: this.order.reference,
      amount: this.order.amount,
      quantity: this.order.products.length,
      //   products: this.order.products,
      orderDate: new Date(this.order.orderDate),
      shippedDate: new Date(this.order.shippedDate),
      address: this.order.shipAddress.address,
      city: this.order.shipAddress.city,
      country: this.order.shipAddress.country,
      zipcode: this.order.shipAddress.zipcode,
      customerId: this.order.customerId,
      isActive: this.order.isActive
    });

    console.log(order.products);

    const products = this.order.products.map(product =>
      this.fb.group({
        productName: [product.productName],
        price: [product.unitPrice]
      })
    );
    const productList = this.fb.array(products);
    this.orderForm.setControl("products", productList);
  }

  deleteOrder(): void {
    if (this.order.id === 0) {
      // Don't delete, it was never saved.
      this.onSaveComplete();
    } else {
      if (confirm(`Really delete the order: ${this.order.reference}?`)) {
        this.orderService
          .deleteOrder(this.order.id)
          .subscribe(
            () => this.onSaveComplete(),
            (error: any) => (this.errorMessage = <any>error)
          );
      }
    }
  }

  saveOrder(): void {
    if (this.orderForm.dirty && this.orderForm.valid) {
      // Copy the form values over the order object values
      let p = Object.assign({}, this.order, this.orderForm.value);

      this.orderService
        .saveOrder(p)
        .subscribe(
          () => this.onSaveComplete(),
          (error: any) => (this.errorMessage = <any>error)
        );
    } else if (!this.orderForm.dirty) {
      this.onSaveComplete();
    }
  }

  onSaveComplete(): void {
    // Reset the form to clear the flags
    this.orderForm.reset();
    this.router.navigate(["/orders"]);
  }

  addProduct(order: IOrder): void {
    let dialogRef = this.dialog.open(ProductDialogComponent, {
      height: "400px",
      width: "600px",
      data: { title: "Dialog", message: "Are sure to delete this item?" }
    });
    dialogRef.disableClose = true;

    dialogRef.afterClosed().subscribe(result => {
      // this.selectedOption = result;
      // if (this.selectedOption === dialogRef.componentInstance.ACTION_CONFIRM) {
      //     this.orderService.deleteOrder(id).subscribe(
      //         () => {
      //             this.orderService.getOrders()
      //                 .subscribe(orders => {
      //                     this.orders = orders;
      //                     this.setPage(1);
      //                 },
      //                 error => this.errorMessage = <any>error);
      //         },
      //         (error: any) => {
      //             this.errorMessage = <any>error;
      //             console.log(this.errorMessage);
      //             this.openSnackBar("This item has not been deleted successfully. Please try again.", "Close");
      //         }
      //     );
      // }
    });
  }

  deleteProduct(product): void {}
}
