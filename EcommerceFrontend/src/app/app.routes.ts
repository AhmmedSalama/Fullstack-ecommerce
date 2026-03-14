import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { NotFound } from './shared/not-found/not-found';
import { Home } from './layout/home/home';
import { Login } from './layout/login/login';
import { Register } from './layout/register/register';
import { Faqs } from './layout/faqs/faqs';
import { Orders } from './layout/orders/orders';
import { Account } from './layout/account/account';
import { ProductDetails } from './layout/product-details/product-details';
import { Cart } from './layout/cart/cart';
import { adminGuard, superAdminGuard, userGuard } from './core/guards/auth-guard';
import { DashProducts } from './dashboard/products/products';
import { DashAdmins } from './dashboard/admins/admins';
import { DashCategories } from './dashboard/categories/categories';
import { DashFaqs } from './dashboard/faqs/faqs';
import { DashOrders } from './dashboard/orders/orders';
import { DashTestimonials } from './dashboard/testimonials/testimonials';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home' , pathMatch: 'full'},
      { path: 'home', component: Home },
      { path: 'product/:slug', component: ProductDetails },
      { path: 'register', component: Register },
      { path: 'login', component: Login },
      { path: 'cart', component: Cart },
      { path: 'orders', component: Orders, canActivate: [userGuard] },
      { path: 'account', component: Account, canActivate: [userGuard] },
      { path: 'FAQs', component: Faqs },
    ],
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', component: DashProducts },
      { path: 'categories', component: DashCategories },
      { path: 'orders', component: DashOrders },
      { path: 'testimonials', component: DashTestimonials },
      { path: 'FAQs', component: DashFaqs },
      { path: 'admins', component: DashAdmins, canActivate: [superAdminGuard] },
    ],
  },
  { path: '**', component: NotFound, title: 'Not Found' },
];
