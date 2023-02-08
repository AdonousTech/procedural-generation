import { AmbientLight, DirectionalLight } from 'three';

export class Lights {

    lights;

    constructor() {
        this.lights = [];

        const dirLight1 = new DirectionalLight( 'white', 3 );
        dirLight1.position.set( 15,10,5 );
        this.lights.push(dirLight1);

        const dirLight2 = new DirectionalLight( 0x002288 );
        dirLight2.position.set( -1, -1, -1 );
        this.lights.push(dirLight2);

        const ambientLight = new AmbientLight( 0x222222 );
        this.lights.push(ambientLight);
    }

    createLights() {
        return this.lights;
    }

}