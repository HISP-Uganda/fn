import { makeAutoObservable } from "mobx";

export class Store {
  indicators = [];
  constructor() {
    makeAutoObservable(this);
  }

  setIndicators = (val) => (this.indicators = val);
  addIndicator = (val) => this.setIndicators([...this.indicators, val]);
  removeIndicator = (val) =>
    this.setIndicators(this.indicators.filter((i) => i !== val));
}
