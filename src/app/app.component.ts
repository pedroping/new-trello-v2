import { AfterViewInit, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VersionCheckService } from '@new-trello-v2/version-checker';

@Component({
  selector: 'new-trello-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class AppComponent {
  // versionCheckService = inject(VersionCheckService);
  // ngAfterViewInit(): void {
  //   this.versionCheckService.start();
  // }
}
