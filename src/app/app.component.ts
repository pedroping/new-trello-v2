import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'new-trello-root',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly swUpdate = inject(SwUpdate);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.activateUpdate();
        }
      });
    }
  }

  private activateUpdate() {
    this.swUpdate.activateUpdate().then(() => {
      if (confirm('New version available, reload now ?'))
        document.location.reload();
    });
  }
}
