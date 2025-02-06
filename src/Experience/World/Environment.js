import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        
        this.setSunLight()
        this.setAmbientLight()
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 3)
        this.sunLight.position.set(5, 5, 5)
        this.scene.add(this.sunLight)

        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('#ffffff', 1)
        this.scene.add(this.ambientLight)
    }
}