
import Environment from './Environment.js'
import * as THREE from 'three'
import House from './House.js'
import Screens from './Screens.js'

export default class World {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // In World.js constructor

        this.resources.on('ready', () => {
            console.log('Resources ready!')
            // In World.js where you load the model
if(this.resources.items.alxislandModel) {
    console.log('Model loaded:', this.resources.items.alxislandModel)
    const model = this.resources.items.alxislandModel.scene
    
    // Adjust these values based on your model size
    model.scale.set(0.1, 0.1, 0.1) // Scale down if needed
    model.position.set(0, 0, 0)     // Center the model
    
    // Optional: rotate if needed
    model.rotation.y = Math.PI * 0.5 // Rotate 90 degrees if needed
    
    this.scene.add(model)
}
        })
    
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.002)
            this.scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 5, 5)
        this.scene.add(directionalLight)
        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.house = new House()
            this.screens = new Screens()
            this.environment = new Environment()
        })
    }

    update() {
        if(this.house)
            this.house.update()
        if(this.screens)
            this.screens.update()
    }
}