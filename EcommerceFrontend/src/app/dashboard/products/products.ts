import { CommonModule, CurrencyPipe, NgOptimizedImage, provideImgixLoader } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IProduct, IProductQuery } from '../../core/models/product.model';
import { ProductsService } from '../../core/services/productsService/products.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesService } from '../../core/services/categoriesService/categories.service';
import { ICategory } from '../../core/models/category.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dash-products',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, NgOptimizedImage],
  providers: [provideImgixLoader(environment.staticUrl)],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class DashProducts implements OnInit {
  productsList = signal<IProduct[]>([]);
  categories = signal<ICategory[]>([]);
  maxPriceInProducts = signal(1000);
  targetProduct = signal<IProduct>({} as IProduct);
  isSuccess = signal(false);
  isError = signal(false);
  alertMessage = signal('');

  searchInput = '';
  selectedCategory = '';
  selectedSubCategory = '';
  minPrice = 0;
  maxPrice = this.maxPriceInProducts();
  sortBy = '';

  productForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl(''),
    subCategoryId: new FormControl('', Validators.required),
    image: new FormControl(null),
  });

  updateProductForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    stock: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl(''),
    subCategoryId: new FormControl('', Validators.required),
    image: new FormControl(null),
  });

  private readonly _productsService = inject(ProductsService);
  private readonly _categoriesService = inject(CategoriesService);
  private readonly _destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
    this.getMaxPrice();
  }

  getProducts(query?: IProductQuery) {
    this._productsService
      .getAllProducts(query)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => this.productsList.set(res.data),
        error: (err) => this.handleError(err),
      });
  }

  getMaxPrice() {
    this._productsService
      .getAllProducts({ sortBy: '-price' })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.maxPriceInProducts.set(res.data[0].price);
          this.maxPrice = this.maxPriceInProducts();
        },
        error: (err) => this.handleError(err),
      });
  }

  getCategories() {
    this._categoriesService
      .getAllCategories()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.categories.set(res.data);
          this.productForm.patchValue({
            categoryId: res.data[0]._id,
            subCategoryId: res.data[0].subCategories[0]._id,
          });
        },
        error: (err) => this.handleError(err),
      });
  }

  search() {
    this.getProducts({ search: this.searchInput });
  }

  applyFilters() {
    const query: IProductQuery = {
      minPrice: this.minPrice.toString(),
      maxPrice: this.maxPrice.toString(),
    };
    if (this.selectedCategory) query.category = this.selectedCategory;
    if (this.selectedSubCategory) query.subCategory = this.selectedSubCategory;
    if (this.sortBy) query.sortBy = this.sortBy;
    this.getProducts(query);
  }

  setImgForAdd(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.productForm.patchValue({ image: input.files[0] as unknown as null });
    }
  }

  addProduct() {
    if (!this.productForm.valid) {
      return this.handleError({ error: { message: 'The Form is not Valid' } });
    }
    if (!this.productForm.value.image) {
      return this.handleError({ error: { message: 'Product image is required' } });
    }
    const formData = new FormData();
    formData.append('title', this.productForm.value.title ?? '');
    formData.append('description', this.productForm.value.description ?? '');
    formData.append('price', this.productForm.value.price?.toString() ?? '');
    formData.append('stock', this.productForm.value.stock?.toString() ?? '');
    formData.append('subCategoryId', this.productForm.value.subCategoryId ?? '');
    formData.append('image', this.productForm.value.image);
    this._productsService
      .addProduct(formData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.getProducts();
          this.productForm.reset();
          this.handleSuccess(res.message);
        },
        error: (err) => this.handleError(err),
      });
  }

  updateProduct(product: IProduct) {
    this.targetProduct.set(product);
    this.updateProductForm.patchValue({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category._id,
      subCategoryId: product.subCategory._id,
    });
  }

  setImgForUpdate(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.updateProductForm.patchValue({ image: input.files[0] as unknown as null });
    }
  }

  confirmUpdate() {
    if (!this.updateProductForm.valid) {
      return this.handleError({ error: { message: 'The Form is not Valid' } });
    }
    const formData = new FormData();
    formData.append('title', this.updateProductForm.value.title ?? '');
    formData.append('description', this.updateProductForm.value.description ?? '');
    formData.append('price', this.updateProductForm.value.price?.toString() ?? '');
    formData.append('stock', this.updateProductForm.value.stock?.toString() ?? '');
    formData.append('subCategoryId', this.updateProductForm.value.subCategoryId ?? '');
    if (this.updateProductForm.value.image) {
      formData.append('image', this.updateProductForm.value.image);
    }
    this._productsService
      .updateProduct(this.targetProduct()._id, formData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.getProducts();
          this.updateProductForm.reset();
          this.handleSuccess(res.message);
        },
        error: (err) => this.handleError(err),
      });
  }

  setTarget(product: IProduct) {
    this.targetProduct.set(product);
  }

  confirmDelete() {
    this._productsService
      .deleteProduct(this.targetProduct()._id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.getProducts();
          this.handleSuccess(res.message);
        },
        error: (err) => this.handleError(err),
      });
  }

  private handleSuccess(msg: string) {
    this.alertMessage.set(msg);
    this.isSuccess.set(true);
    setTimeout(() => this.isSuccess.set(false), 2500);
  }

  private handleError(err: { error?: { message?: string } }) {
    this.alertMessage.set(err.error?.message || 'An error occurred');
    this.isError.set(true);
    setTimeout(() => this.isError.set(false), 2500);
  }
}
