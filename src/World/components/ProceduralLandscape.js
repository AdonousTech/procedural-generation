import { CylinderGeometry, 
         Mesh, 
         MeshBasicMaterial, 
         MeshPhongMaterial, 
         MeshStandardMaterial,
         PlaneGeometry
        } from "three";
import { TerrainNoise } from "../systems/TerrainNoise";  

export class ProceduralLandscape extends Mesh {

    colors;
    detail; // Interpolation detail value
    
    // 3 dimensions of the terrain.
    // Each dimension affects n vertices
    terrainXAmplitude;
    terrainYAmplitude;
    terrainZAmplitude;

    constructor(delayGeneration) {
    super();

      // Initialize colors (for testing mostly)
      this.colors = [
        "#1f77b4", // blue
        "#ff7f0e", // orange
        "#2ca02c", // green
        "#d62728", // red
        "#9467bd", // purple
        "#8c564b", // brown
        "#e377c2", // pink
        "#7f7f7f", // gray
        "#bcbd22", // yellow-green
        "#17becf"  // light blue
      ];

      let geometry;
      // Create a PlaneGeometry
      if (!delayGeneration) {
        geometry = new PlaneGeometry(2000, 2000, 20, 20);
      } else {
        geometry = new PlaneGeometry(50, 50, 20, 20)
      }

      // Create a material
      const material = new MeshBasicMaterial({ color: this.getRandomColor(), wireframe: true });

      this.material = material;
      this.geometry = geometry;

      // Set terrain amplitude defaults for the generateTerrain method
      if(!delayGeneration) {
        this.terrainXAmplitude = 20;
        this.terrainYAmplitude = -20;
        this.terrainZAmplitude = -250;
        this.terrainZCameraOffset = 0;
      } else {
        this.terrainXAmplitude = 20;
        this.terrainYAmplitude = -20;
        this.terrainZAmplitude = -250;
        this.terrainZCameraOffset = 0;
      }

  
      // Call the custom noise algorithm
      if (!delayGeneration) {
        this.generateTerrain(this.geometry);
        // Smooth out the terrain
        this.detail = 100;
        this.smoothTerrain(this.geometry);
      }

    }
  
    generateTerrain(geometry) {
      // Get the position attribute
      const position = geometry.attributes.position;
  
      // Loop over the vertices
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const alphaZ = position.getZ(i);
        const alphaY = position.getY(i);

        let z = this.generateZNoise(x, alphaY, 5)
        let y = this.generateYNoise(x, 5, alphaZ);

        //console.log(x,y,z);
  
        // Set the new position
        position.setX(i, x + Math.random() * this.terrainXAmplitude);
        position.setY(i, y + Math.random() * this.terrainYAmplitude);

        // Set the z-value closer to the camera
        // 250 is the offset value to bring the hill closer to the camera
        // -500 is rnd between 0 -500 equating to varied distance from camera
        position.setZ(i, z + Math.random() * this.terrainZAmplitude + this.terrainZCameraOffset);

        // Set the position of the entire mesh to the default
        console.log('procedural position :: ', this.position);
      }
  
      // Update the geometry
      geometry.computeVertexNormals();
    }

    generateTerrainChunk() {
      this.generateTerrain(this.geometry);
      // Smooth out the terrain
      this.detail = 100;
      console.log('chunk vertices before smoothing :: ', this.geometry.attributes.position);
      this.smoothTerrain(this.geometry);
      console.log('chunk vertices after smoothing :: ', this.geometry.attributes.position);
      return this;
    }

    generateNoise(x, y) {
        let noise = 0;
        let scale = 1;
        let max = 0;
        let scaleFactor = 5;
      
        // Loop over the octaves
        for (let i = 0; i < 5; i++) {
          noise += Math.abs(Math.sin(x / scale) * Math.cos(y / scale)) * (1 / scale) * scaleFactor;
          scale *= 2;
          max += (1 / scale);
        }
      
        return noise / max;
    }

    generateYNoise(x, octaves, z) {
        let noise = 0;
        let scale = 1;
        let max = 0;
        let scaleFactor = 20;
      
        // Loop over the octaves
        for (let i = 0; i < octaves; i++) {
          noise += Math.abs(Math.sin(x / scale) * Math.cos(z / scale)) * (1 / scale) * scaleFactor;
          scale *= 2;
          max += (1 / scale);
        }
      
        return noise / max;
    }

    generateZNoise(x, y, octaves) {
        let noise = 0;
        let scale = 1;
        let max = 0;
        let scaleFactor = 20;
      
        // Loop over the octaves
        for (let i = 0; i < octaves; i++) {
          noise += Math.abs(Math.sin(x / scale) * Math.cos(y / scale)) * (1 / scale) * scaleFactor;
          scale *= 2;
          max += (1 / scale);
        }
      
        return noise / max;
    }

    smoothTerrain(geometry) {
        const detail = this.detail;
        const position = geometry.attributes.position;
        const vertices = geometry.attributes.position.array;
        for (let i = 0, j = 0; i < vertices.length; i++, j += 3) {
          const vertex = { x: vertices[j], y: vertices[j + 1], z: vertices[j + 2] };
          if (isNaN(vertex.z)) {
            continue;
          }
      
          // smooth the hills on the z-axis
          let z = 0;
          for (let x = vertex.x - detail; x <= vertex.x + detail; x += detail) {
            for (let y = vertex.y - detail; y <= vertex.y + detail; y += detail) {
              const displacement = this.generateNoise(x, y);
              z += displacement;
            }
          }
          z /= Math.pow(detail * 2, 2);
          vertex.z = vertex.z + (z - vertex.z) * 0.5;
          vertices[j] = vertex.x;
          vertices[j + 1] = vertex.y;
          vertices[j + 2] = vertex.z;

        // smooth the hills on the x-axis
        let x = 0;
         for (let y = vertex.y - detail; y <= vertex.y + detail; y += detail) {
            for (let z = vertex.z - detail; z <= vertex.z + detail; z += detail) {
                const displacement = this.generateNoise(x, y, z);
                x += displacement;
            }
        }
        x /= Math.pow(detail * 2, 2);
        vertex.x = vertex.x + (x - vertex.x) * 0.5;
        vertices[j] = vertex.x;
        vertices[j + 1] = vertex.y;
        vertices[j + 2] = vertex.z;

        }

        for (let i = 0; i < position.count; i++) {
            const alphaX = position.getX(i);
            const alphaY = position.getY(i);
            const alphaZ = position.getZ(i);
    
            //console.log(alphaX,alphaY,alphaZ);
      
            // Set the new position
            position.setX(i, alphaX);
            position.setY(i, alphaY);
            position.setZ(i, alphaZ);
          }
      
        this.geometry.computeVertexNormals();
        this.geometry.computeBoundingSphere();
    }

    getRandomColor() {
      return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

}
  