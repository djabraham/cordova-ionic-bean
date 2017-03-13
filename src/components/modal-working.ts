
import { Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'modal-working',
  templateUrl: 'modal-working.html'
})
export class ModalWorking implements OnDestroy {
  private currentTimeout: any;
  private isDelayedRunning: boolean = false;

  @Input()
  public delay: number = 50;

  @Input()
  public set isRunning(value: boolean) {
    if (!value) {
      this.cancelTimeout();
      this.isDelayedRunning = false;
    }

    if (this.currentTimeout) {
      return;
    }

    this.currentTimeout = setTimeout(() => {
      this.isDelayedRunning = value;
      this.cancelTimeout();
    }, this.delay);
  }

  // public get isRunning() {

  // }

  private cancelTimeout(): void {
    clearTimeout(this.currentTimeout);
    this.currentTimeout = undefined;
  }

  ngOnDestroy(): any {
    this.cancelTimeout();
  }
}

