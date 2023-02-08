import { Box3, CylinderGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, PlaneGeometry } from "three";
import { ProceduralLandscape } from "./ProceduralLandscape";
export class ChunkedLandscape {

    camera;
    scene;
    terrainChunkSize; // size of each terrain chunk
    terrainChunks; // array to store terrain chunks
    proceduralLandscape;

    constructor(scene, camera) {

        this.proceduralLandscape = new ProceduralLandscape(true);
        this.scene = scene;
        //console.log('this.scene :: ', this.scene);
        this.terrainChunkSize = 50;
        //this.terrainChunks = [];
        this.terrainChunks = new Map();
    }

    // function to check if a terrain chunk already exists at the given position
    // x, y are typically floating point, so we use Number.EPSILON for equality checking
/*     chunkExistsAt(x, y) {
        for (let i = 0; i < this.terrainChunks.length; i++) {
            const chunk = this.terrainChunks[i];
            if (Math.abs(chunk.attributes.position.x - x) < Number.EPSILON &&
                Math.abs(chunk.attributes.position.y - y) < Number.EPSILON) {
                return true;
            }
        }
        return false;
    } */

    chunkExistsAt(x, y) {
        return this.terrainChunks.has(`${x},${y}`);
    }

    // function to generate a terrain chunk at the given position
    generateChunkAt(PC) {
        const PCWDirection =  PC.getTargetPosition().clone().sub(PC.position).normalize();
        console.log('PCWDirection :: ', PCWDirection);
        const PCWPosition = PC.position.clone();
        //console.log('Called generateChunkAt :: ', PCWPosition);
        console.log('PCWPosition', PCWPosition);
        //console.log(`Request chunk generation at ${PCWPosition.x,PCWPosition.y}`);
        if (!this.chunkExistsAt(PCWPosition.x, PCWPosition.y)) {
            console.log(`Chunk exists at ${PCWPosition.x,PCWPosition.y}`);
            //const chunk = new PlaneGeometry(this.terrainChunkSize, this.terrainChunkSize, 32, 32);
            const chunkMesh = this.proceduralLandscape.generateTerrainChunk();
            // TODO: use your noise algorithm to generate the terrain heights
/*             for (let i = 0; i < chunk.attributes.position.length; i++) {
                const vertex = chunk.attributes.position[i];
                vertex.z = this.generateZNoise(vertex.x + x, vertex.y + y);
                vertex.x = this.generateNoise(vertex.x + x, vertex.y + y);
                chunk.attributes.position.Y(chunk.attributes.position[i],x, y);
            }
            chunk.normalizeNormals();
            chunk.computeVertexNormals(); */
            this.terrainChunks.set(`${PCWPosition.x},${PCWPosition.y}`, chunkMesh);
            console.log ('terrain chunks update map ', this.terrainChunks);
             if (chunkMesh) {
                if (chunkMesh instanceof Object3D) {
                    let chunkMeshWidth;
                    let box = new Box3();
                    box.setFromObject(chunkMesh);
                    chunkMeshWidth = box.max.y - box.min.y;
                    console.log('chunkMeshWidth :: ', chunkMeshWidth);
                    //const newChunkPosition = PC.position.clone().add(direction.clone().multiplyScalar(distance));

                    //PCWPosition.x += PCWDirection.x * this.terrainChunkSize / 2 + 5;
                    //PCWPosition.y += PCWDirection.y * this.terrainChunkSize / 2 + 5;
                    //PCWPosition.z += PCWDirection.z * this.terrainChunkSize / 2 + 5;

                    chunkMesh.position.set(PC.getTargetPosition().x, 0, PC.getTargetPosition().z);
                    chunkMesh.updateMatrix();
                    chunkMesh.matrixAutoUpdate = false;
                    this.scene.add(chunkMesh);
                  } else {
                    console.error("Error: chunkMesh is not an instance of THREE.Object3D", chunk);
                }
            }
        } else {
            console.log('chunk exist');
        }
    }

    getCurrentChunkCount() {
        //console.log('called getCurrentChunkCount :: ', this.terrainChunks.size);
        return this.terrainChunks.size;
    }

    // function to update the terrain
    update(cameraPosition) {
        // calculate the position of the camera in chunk coordinates
        const chunkX = Math.floor(cameraPosition.x / this.terrainChunkSize) * this.terrainChunkSize;
        const chunkY = Math.floor(cameraPosition.y / this.terrainChunkSize) * this.terrainChunkSize;

        // generate the 4 chunks surrounding the camera
        this.generateChunkAt(chunkX - this.terrainChunkSize, chunkY - this.terrainChunkSize);
        this.generateChunkAt(chunkX + this.terrainChunkSize, chunkY - this.terrainChunkSize);
        this.generateChunkAt(chunkX - this.terrainChunkSize, chunkY + this.terrainChunkSize);
        this.generateChunkAt(chunkX + this.terrainChunkSize, chunkY + this.terrainChunkSize);
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
    
            console.log(alphaX,alphaY,alphaZ);
      
            // Set the new position
            position.setX(i, alphaX);
            position.setY(i, alphaY);
            position.setZ(i, alphaZ);
          }
      
        this.geometry.computeVertexNormals();
        this.geometry.computeBoundingSphere();
    }

}