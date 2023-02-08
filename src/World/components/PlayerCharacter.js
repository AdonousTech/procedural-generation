import { CylinderGeometry, 
         Frustum, 
         MathUtils, 
         Matrix4, 
         Mesh, 
         MeshStandardMaterial, 
         Sphere, 
         Vector2, 
         Vector3 } from "three";
import { MyRayCaster } from "./Ray";

export class PlayerCharacter extends Mesh {

    camera;
    cameraWorldPosition;
    container;
    playerCharacter;
    pcTargetPosition;
    pcWorldPosition;
    raycaster;
    scene;
    viewFrustrum;

    constructor(camera, container, scene) {
        super();

        this.camera = camera;
        this.container = container;
        this.scene = scene;

        this.cameraWorldPosition = new Vector3();
        this.pcWorldPosition = new Vector3();
        this.viewFrustum = new Frustum();

        this.raycaster = new MyRayCaster().createRayCaster();

        this.createPC();
    }

    createPC() {
        const playerCharacterGeometry = new CylinderGeometry( 5,5,20,32 );
        const playerCharacterMaterial = new MeshStandardMaterial({ color: 'yellow' });

        // Initialize the PC
        this.geometry = playerCharacterGeometry;
        this.material = playerCharacterMaterial;
        this.position.y = 0; // Move PC to ground
        this.pcTargetPosition = this.position.clone();

        // Mechanics
        this.initializePCMechanics();

        return this;
    }

    initializePCMechanics() {
        this.camera.lookAt( this.position );

        // Move the PC to a specific point on the canvas when clicked with the mouse
        document.addEventListener('click', event => {
            // Convert mouse position to 3D world position
            const mouse = new Vector2;
            
            //**IMPORTANT - use window.innerWidth and window.innerHeight here, 
            // otherwise the Raycaster does not pick up intersections if using container
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
            
            // Init raycaster
            this.raycaster.setFromCamera(mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);
            console.log("TRUE")
            if (intersects.length > 0) {
                // Set target position to the point where the mouse clicked on the cylinder
                this.pcTargetPosition.copy(intersects[0].point);
            }
        });

    }

    syncUpdateCameraAndPC() {
        console.log('this.pcTargetPosition :: ', this.pcTargetPosition);
        // Update the PCs world position
        this.updateMatrixWorld();

        // Move the PC towards the target position
        this.position.lerp(this.pcTargetPosition, 0.1);
        this.pcWorldPosition.setFromMatrixPosition(this.matrixWorld);

        // Lerp to the PCs position (creates a camera follow effect)
        const offset = new Vector3(0, 30, -100);
        const speed = 0.05;
        const pcTargetPositionWithOffset = this.pcTargetPosition.clone().add(offset);
        this.camera.position.x = MathUtils.lerp(this.camera.position.x, pcTargetPositionWithOffset.x, speed);
        this.camera.position.y = MathUtils.lerp(this.camera.position.y, pcTargetPositionWithOffset.y, speed);
        this.camera.position.z = MathUtils.lerp(this.camera.position.z, pcTargetPositionWithOffset.z, speed);

        // Look at the PCs eventual/target position
        this.camera.lookAt(this.pcTargetPosition);

        // update the camera's world position
        this.camera.updateMatrixWorld();
        this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

        // update the view frustum
        this.viewFrustum.setFromProjectionMatrix(new Matrix4().multiplyMatrices(
            this.camera.projectionMatrix, this.camera.matrixWorldInverse
        ));

        // Check if the PC is within the view frustum
        if (!this.viewFrustum.intersectsSphere(new Sphere(this.pcWorldPosition, this.geometry.parameters.radius))) {
            // if not, smoothly pan the camera on the x axis to keep the PC in view
            const lerpAmount = 0.05;
            const targetX = MathUtils.lerp(this.cameraWorldPosition.x, this.pcWorldPosition.x, lerpAmount);
            this.camera.position.setX(targetX);
        }
    }

    getTargetPosition() {
        return this.pcTargetPosition;
    }

    
}