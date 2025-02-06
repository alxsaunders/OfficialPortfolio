import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Screens {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.raycaster = new THREE.Raycaster()
        
        this.setupScreens()
        this.setupInteraction()
    }

    setupScreens() {
        // Find screen meshes in your model
        this.screens = {}
        this.experience.world.house.model.scene.traverse((child) => {
            if(child.name.includes('Screen')) {
                this.screens[child.name] = child
                // Set up screen materials and textures
                child.material = new THREE.MeshBasicMaterial({
                    map: this.resources.items.projectsTexture
                })
            }
        })
    }

    setupInteraction() {
        window.addEventListener('click', (event) => {
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            )

            this.raycaster.setFromCamera(mouse, this.experience.camera.instance)
            
            const intersects = this.raycaster.intersectObjects(
                Object.values(this.screens)
            )

            if(intersects.length) {
                const screen = intersects[0].object
                this.handleScreenClick(screen.name)
            }
        })
    }

    handleScreenClick(screenName) {
        // Handle screen interactions
        console.log(`Clicked ${screenName}`)
        // Add your screen content switching logic here
    }

    update() {
        // Add any animations or updates needed
    }
}