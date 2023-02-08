import { Raycaster } from "three";

export class MyRayCaster extends Raycaster {
    constructor() {
        super();
    }

    createRayCaster() {
        return this;
    }
}