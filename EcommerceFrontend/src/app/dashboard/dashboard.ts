import { Component } from '@angular/core';
import { DashHeader } from './header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from "../shared/footer/footer";

@Component({
  selector: 'app-dashboard',
  imports: [DashHeader, RouterOutlet, Footer],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
