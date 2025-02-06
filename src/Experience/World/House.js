import * as THREE from 'three'
import Experience from '../Experience.js'

export default class House {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        // Setup
        this.model = this.resources.items.houseModel
        this.setModel()
    }

    setModel() {
        this.model.scene.scale.set(1, 1, 1)
        this.scene.add(this.model.scene)

        this.model.scene.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    update() {
        // Add any animations or updates needed
    }
}