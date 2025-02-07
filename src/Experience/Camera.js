import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor() {
        this.experience = window.experience
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        this.setControls()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            45, // Field of view
            this.sizes.width / this.sizes.height,
            0.1,
            100
        )
        // Adjust these values to get a better view of your island
        this.instance.position.set(-15, 10, 15) // Move camera back and up
        this.scene.add(this.instance)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.screenSpacePanning = false
        
        // Set min and max distance for zoom
        this.controls.minDistance = 5
        this.controls.maxDistance = 30
        
        // Limit vertical rotation if needed
        this.controls.minPolarAngle = Math.PI * 0.25 // 45 degrees from top
        this.controls.maxPolarAngle = Math.PI * 0.75 // 135 degrees from top

        // Make the camera look at the center of your scene
        this.controls.target.set(0, 0, 0)
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
    }
}