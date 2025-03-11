import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera {
    constructor() {
        this.experience = window.experience
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.time = this.experience.time
        this.debug = this.experience.debug

        // EXACT POSITION FROM SCREENSHOT
        // This matches your current view perfectly
        this.initialPosition = {
            x: -3.66, // From screenshot
            y: 3.04,  // From screenshot
            z: -20.11 // From screenshot
        }
        
        // Where the camera will animate to (can match initial if no animation desired)
        this.finalPosition = {
            x: -3.66, // From screenshot
            y: 3.04,  // From screenshot
            z: -20.11
        }
        
        // Camera target position from screenshot
        this.targetPosition = {
            x: -3.90, // From screenshot
            y: 0.49,  // From screenshot
            z: -1.49  // From screenshot
        }
        
        // Other camera configuration
        this.config = {
            fov: 45,
            near: 0.1,
            far: 100,
            minDistance: 5,
            maxDistance: 30,
            minPolarAngle: Math.PI * 0.15, // Allow more upward view (30° from top)
            maxPolarAngle: Math.PI * 0.85  // Allow more downward view (150° from top)
        }

        // Position logging
        this.lastLogTime = 0
        this.logInterval = 5000 // 5 seconds in milliseconds
        
        // Setup
        this.setInstance()
        this.setControls()
        this.createPositionDisplay()
        
        // Optional: Play intro animation
        // Uncomment this to enable a startup animation
        // this.playIntroAnimation()
        
        // Debug
        if(this.debug && this.debug.active) {
            this.setupDebugPanel()
        }
    }

    createPositionDisplay() {
        // Create element to display camera position if it doesn't exist
        if (!document.getElementById('camera-position-display')) {
            const positionDisplay = document.createElement('div')
            positionDisplay.id = 'camera-position-display'
            positionDisplay.style.position = 'fixed'
            positionDisplay.style.bottom = '10px'
            positionDisplay.style.left = '10px'
            positionDisplay.style.background = 'rgba(0, 0, 0, 0.7)'
            positionDisplay.style.color = 'white'
            positionDisplay.style.padding = '10px'
            positionDisplay.style.fontFamily = 'monospace'
            positionDisplay.style.fontSize = '12px'
            positionDisplay.style.borderRadius = '4px'
            positionDisplay.style.zIndex = '1000'
            document.body.appendChild(positionDisplay)
        }
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            this.config.fov,
            this.sizes.width / this.sizes.height,
            this.config.near,
            this.config.far
        )
        
        // Set camera to initial position
        this.instance.position.set(
            this.initialPosition.x,
            this.initialPosition.y,
            this.initialPosition.z
        )
        
        this.scene.add(this.instance)
        
        console.log('Camera initialized at:', {
            position: { ...this.instance.position },
        })
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.screenSpacePanning = false
        
        // Set min and max distance for zoom
        this.controls.minDistance = this.config.minDistance
        this.controls.maxDistance = this.config.maxDistance
        
        // Limit vertical rotation
        this.controls.minPolarAngle = this.config.minPolarAngle
        this.controls.maxPolarAngle = this.config.maxPolarAngle

        // Set target from config
        this.controls.target.set(
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z
        )
        
        // Update controls
        this.controls.update()
        
        console.log('Camera controls target set to:', {
            target: { ...this.controls.target }
        })
    }
    
    // Optional: Use this for a startup animation
    playIntroAnimation() {
        // Far starting position for dramatic effect
        const farStartPosition = {
            x: this.initialPosition.x * 1.5,
            y: this.initialPosition.y * 1.5,
            z: this.initialPosition.z * 1.5
        }
        
        // Set to far position first
        this.instance.position.set(
            farStartPosition.x,
            farStartPosition.y,
            farStartPosition.z
        )
        
        // Temporarily disable controls during animation
        this.controls.enabled = false
        
        // Animate camera from far to normal position
        gsap.timeline()
            // Optional delay
            .to({}, { duration: 0.5 })
            // Animate to final position
            .to(this.instance.position, {
                duration: 3.0, // Longer for more dramatic effect
                x: this.finalPosition.x,
                y: this.finalPosition.y,
                z: this.finalPosition.z,
                ease: "power2.inOut",
                onUpdate: () => {
                    this.controls.update()
                },
                onComplete: () => {
                    this.controls.enabled = true
                    console.log('Camera intro animation completed')
                }
            })
    }
    
    setupDebugPanel() {
        if (!this.debug || !this.debug.ui) return
        
        // Create camera debug folder
        const cameraFolder = this.debug.ui.addFolder('Camera')
        
        // Position controls
        cameraFolder.add(this.initialPosition, 'x', -50, 50, 0.01).name('Position X')
            .onChange(() => this.updatePosition())
        cameraFolder.add(this.initialPosition, 'y', -50, 50, 0.01).name('Position Y')
            .onChange(() => this.updatePosition())
        cameraFolder.add(this.initialPosition, 'z', -50, 50, 0.01).name('Position Z')
            .onChange(() => this.updatePosition())
        
        // Target controls
        cameraFolder.add(this.targetPosition, 'x', -50, 50, 0.01).name('Target X')
            .onChange(() => this.updateTarget())
        cameraFolder.add(this.targetPosition, 'y', -50, 50, 0.01).name('Target Y')
            .onChange(() => this.updateTarget())
        cameraFolder.add(this.targetPosition, 'z', -50, 50, 0.01).name('Target Z')
            .onChange(() => this.updateTarget())
            
        // Animation control
        cameraFolder.add(this, 'playIntroAnimation').name('Play Intro Animation')
        cameraFolder.add(this, 'resetCamera').name('Reset Camera')
    }
    
    updatePosition() {
        this.instance.position.set(
            this.initialPosition.x,
            this.initialPosition.y,
            this.initialPosition.z
        )
        this.controls.update()
    }
    
    updateTarget() {
        this.controls.target.set(
            this.targetPosition.x,
            this.targetPosition.y,
            this.targetPosition.z
        )
        this.controls.update()
    }
    
    resetCamera() {
        gsap.to(this.instance.position, {
            duration: 1,
            x: this.initialPosition.x,
            y: this.initialPosition.y,
            z: this.initialPosition.z,
            ease: "power2.out"
        })
        
        gsap.to(this.controls.target, {
            duration: 1,
            x: this.targetPosition.x,
            y: this.targetPosition.y,
            z: this.targetPosition.z,
            ease: "power2.out",
            onUpdate: () => {
                this.controls.update()
            }
        })
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        this.controls.update()
        
        // Log camera position every 5 seconds
        if (this.time && (this.time.elapsed - this.lastLogTime > this.logInterval)) {
            const positionInfo = {
                position: {
                    x: parseFloat(this.instance.position.x.toFixed(2)),
                    y: parseFloat(this.instance.position.y.toFixed(2)), 
                    z: parseFloat(this.instance.position.z.toFixed(2))
                },
                target: {
                    x: parseFloat(this.controls.target.x.toFixed(2)),
                    y: parseFloat(this.controls.target.y.toFixed(2)),
                    z: parseFloat(this.controls.target.z.toFixed(2))
                }
            }
            
            console.log('Current camera position:', positionInfo)
            
            // Update position display element
            const positionDisplay = document.getElementById('camera-position-display')
            if (positionDisplay) {
                positionDisplay.innerHTML = `
                    <div><strong>Camera Position:</strong></div>
                    <div>X: ${positionInfo.position.x.toFixed(2)}</div>
                    <div>Y: ${positionInfo.position.y.toFixed(2)}</div>
                    <div>Z: ${positionInfo.position.z.toFixed(2)}</div>
                    <div><strong>Camera Target:</strong></div>
                    <div>X: ${positionInfo.target.x.toFixed(2)}</div>
                    <div>Y: ${positionInfo.target.y.toFixed(2)}</div>
                    <div>Z: ${positionInfo.target.z.toFixed(2)}</div>
                `
            }
            
            this.lastLogTime = this.time.elapsed
        }
    }
}