import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports: [RouterModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent implements OnInit {
  constructor(private router: Router) {}
  ngOnInit(): void {
    // const userComesFromGuard = history.state?.fromGuard;
    // if (!userComesFromGuard) {
    //   this.router.navigateByUrl('/');
    // }
  }
}
