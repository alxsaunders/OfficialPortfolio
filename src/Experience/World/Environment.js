import * as THREE from 'three'

export default class Environment {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Wait for resources
        this.resources.on('ready', () => {
            this.setEnvironmentMap()
        })
        
        this.setSunLight()
        this.setAmbientLight()
    }

    setEnvironmentMap() {
        this.environmentMap = {}
        
        // Get the HDR texture
        this.environmentMap.texture = this.resources.items.environmentMap
        const renderer = this.experience.renderer.instance
        
        // Create and configure PMREMGenerator
        this.environmentMap.pmremGenerator = new THREE.PMREMGenerator(renderer)
        this.environmentMap.pmremGenerator.compileEquirectangularShader()
        
        // Generate environment map
        const envMap = this.environmentMap.pmremGenerator.fromEquirectangular(
            this.environmentMap.texture
        ).texture
        
        // Set background and environment
        
        
        this.scene.background = envMap
        this.scene.environment = envMap
        
        // Apply environment map to all existing materials
        this.scene.traverse((child) => {
            if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = envMap
                child.material.envMapIntensity = .001
                child.material.needsUpdate = true
            }
        })
        
        // Dispose of unused resources
        this.environmentMap.pmremGenerator.dispose()
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 1)
        this.sunLight.position.set(5, 5, 5)
        this.scene.add(this.sunLight)

        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.5

        // Add shadow camera helper for debugging
        // const helper = new THREE.CameraHelper(this.sunLight.shadow.camera)
        // this.scene.add(helper)
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.3)
        this.scene.add(this.ambientLight)
    }

    update() {
        // Add any update logic here if needed
    }

    destroy() {
        // Cleanup resources when destroyed
        if(this.environmentMap) {
            if(this.environmentMap.texture) {
                this.environmentMap.texture.dispose()
            }
            if(this.environmentMap.pmremGenerator) {
                this.environmentMap.pmremGenerator.dispose()
            }
        }
    }
}