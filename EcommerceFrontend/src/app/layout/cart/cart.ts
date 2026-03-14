import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../core/services/cartService/cart.service';
import { LocalCartService } from '../../core/services/localCartService/local.cart.service';
import { AuthService } from '../../core/services/authService/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICart, IItem, Product } from '../../core/models/cart.model';
import { CommonModule, CurrencyPipe, NgOptimizedImage, provideImgixLoader } from '@angular/common';
import { environment } from '../../../environments/environment';
import { OrdersService } from '../../core/services/ordersService/orders.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/usersService/users.service';
import { IUser } from '../../core/models/user.model';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, NgOptimizedImage, CurrencyPipe, RouterLink, FormsModule],
  providers: [provideImgixLoader(environment.staticUrl)],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cart = signal<ICart>({} as ICart);
  userData = signal<IUser>({} as IUser);
  isLoggedin = signal(false);
  isPriceChanged = signal(false);
  isSuccess = signal(false);
  isError = signal(false);
  alertMessage = signal('');

  private readonly _authService = inject(AuthService);
  private readonly _usersService = inject(UsersService);
  private readonly _ordersService = inject(OrdersService);
  private readonly _cartService = inject(CartService);
  private readonly _localCartService = inject(LocalCartService);
  private readonly _destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isLoggedin.set(this._authService.isLoggedin());
    this.getCart();
    this.getUser();
  }

  getCart() {
    if (this.isLoggedin()) {
      this._cartService.getCart().pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: (res) => {
          this.cart.set(res.data);
          this.isPriceChanged.set(this.cart().items.some((item) => item.isChanged));
        },
        error: (err) => this.handleError(err)
      });
    } else {
      const localCart = this._localCartService.getLocalCart();
      if (localCart) {
        let totalQuantity = 0;
        let totalPrice = 0;
        const items: IItem[] = localCart.map(item => {
          totalPrice += Number(item.priceAtAdding);
          totalQuantity += Number(item.quantity);
          return {
            _id: '',
            product: { _id: item.productId, title: item.title, price: item.priceAtAdding, stock: item.stock, image: item.image },
            quantity: item.quantity,
            priceAtAdding: item.priceAtAdding,
            isChanged: false
          };
        });
        this.cart.set({ _id: '', user: '', items, totalQuantity, totalPrice, createdAt: '', updatedAt: '', __v: 0 });
      }
    }
  }

  getUser() {
    this._usersService.getLoggedInUser().pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: (res) => this.userData.set(res.data),
      error: (err) => this.handleError(err)
    });
  }

  increaseQuantity(product: Product, input: HTMLInputElement) {
    const max = Number(input.max);
    let current = Number(input.value) || 1;
    if (current < max) {
      current++;
      input.value = String(current);
      this.updateQuantity(product, current);
    } else {
      this.showError('You hit the maximum quantity in our stock');
    }
  }

  decreaseQuantity(product: Product, input: HTMLInputElement) {
    const min = Number(input.min) || 1;
    let current = Number(input.value) || min;
    if (current > min) {
      current--;
      input.value = String(current);
      this.updateQuantity(product, current);
    }
  }

  updateQuantity(product: Product, quantity: number) {
    if (this.isLoggedin()) {
      this._cartService.addToCart({ productId: product._id, quantity }).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: () => this.getCart(),
        error: (err) => this.handleError(err)
      });
    } else {
      this._localCartService.addToLocalCart({
        productId: product._id, title: product.title, image: product.image,
        stock: product.stock, priceAtAdding: product.price, quantity
      });
      this.getCart();
    }
  }

  removeFromCart(productId: string) {
    if (this.isLoggedin()) {
      this._cartService.removeFromCart(productId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: (res) => {
          this.getCart();
          this.showSuccess(res.message);
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this._localCartService.removeFromLocalCart(productId);
      this.getCart();
      this.showSuccess('Product Removed From your cart successfully');
    }
  }

  returnToCart(item: IItem) {
    item.isChanged = false;
    this.isPriceChanged.set(this.cart().items.some((i) => i.isChanged));
  }

  makeOrder() {
    const products = this.cart().items
      .filter(item => !item.isChanged)
      .map(item => ({ productId: item.product._id, quantity: item.quantity }));

    const address = this.userData().addresses?.find(a => a.isDefault);
    const phone = this.userData().phones?.find(p => p.isDefault);

    if (address && phone) {
      this._ordersService.makeOrder({ products, shippingAddress: address, phone: phone.number })
        .pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
          next: (res) => {
            this._cartService.clearCart().subscribe(() => this.getCart());
            this.showSuccess(res.message);
          },
          error: (err) => this.handleError(err)
        });
    } else {
      this.showError('You do not have address or phone number, enter them from your profile');
    }
  }

  private handleError(err: { error?: { message?: string } }) {
    this.alertMessage.set(err.error?.message || 'An error occurred');
    this.isError.set(true);
    setTimeout(() => this.isError.set(false), 2500);
  }

  private showSuccess(msg: string) {
    this.alertMessage.set(msg);
    this.isSuccess.set(true);
    setTimeout(() => this.isSuccess.set(false), 2500);
  }

  private showError(msg: string) {
    this.alertMessage.set(msg);
    this.isError.set(true);
    setTimeout(() => this.isError.set(false), 3500);
  }
}
