import { PerspectiveCamera } from "three";

export class Camera extends PerspectiveCamera {

    constructor() {
        super();
        this.fov = 60;
        this.aspect = window.innerWidth / window.innerHeight;
        this.near = 1;
        this.far = 300;
        this.position.set( 400, 200, 0 );
    }

    createCamera() {
        return this;
    }

}