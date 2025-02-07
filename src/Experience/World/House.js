import * as THREE from 'three'

export default class House {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        // Only set up the model if it's available
        if (this.resources.items.alxislandModel) {
            this.setModel()
        } else {
            // Wait for the model to load
            this.resources.on('ready', () => {
                if (this.resources.items.alxislandModel) {
                    this.setModel()
                }
            })
        }
    }

    setModel() {
        this.model = this.resources.items.alxislandModel
        if (!this.model || !this.model.scene) {
            console.error('Model or model scene is undefined')
            return
        }

        this.actualModel = this.model.scene
        
        // Set up the model
        this.actualModel.scale.set(.1, .1, .1)
        this.actualModel.position.set(0, 0, 0)
        this.scene.add(this.actualModel)

        // Set up shadows
        this.actualModel.traverse((child) => {
            if(child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    update() {
        // Add any update logic here
    }
}