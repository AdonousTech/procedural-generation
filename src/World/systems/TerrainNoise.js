export class TerrainNoise {

    scale;
    size;
    terrain;

    constructor() {
        this.scale = 100;
        this.size = 500;
        this.terrain = [];

        // generate the terrain values
        this.generateTerrain();
    }

    generateNoise(x,y) {

        let amplitude = 1;
        let frequency = 0.01;
        let maxAmplitude = 0;
        let noise = 0;

        // specify number of octaves used in the noise algorithm
        // this determines level of detail
        for (let i = 0; i < 5; i++) {
            noise += amplitude * Math.sin(2 * Math.PI * frequency * x) * Math.sin(2 * Math.PI * frequency * y);
            maxAmplitude += amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return noise / maxAmplitude;

    }

    generateTerrain() {

        for (let i = 0; i < this.size; i++) {
            this.terrain[i] = [];
            for (let j = 0; j < this.size; j++) {
              this.terrain[i][j] = this.generateNoise(i / this.scale, j / this.scale);
            }
        }

        return this.terrain;

    }

    createTerrain() {
        return this;
    }


}