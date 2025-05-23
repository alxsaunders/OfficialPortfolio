import * as THREE from 'three'

export default class ScreenTextures {
    constructor(screensManager) {
        this.screens = screensManager
        
        // Initialize video properties
        this.videoElement = null
        this.isVideoPlaying = false
        this.videoTexture = null

        // Screen-specific transform configurations
        this.screenTransforms = {
            'Screen_About': {
                offsetX: -0.12999999999999998,
                offsetY: 0.5,
                scale: 6.199999999999995,
                rotation: 0,
                invertX: false,
                invertY: true,
                fullscreen: true
            },
            'Screen_Credits': {
                offsetX: 0.13,
                offsetY: 0.6,
                scale: 2.100000000000001,
                rotation: -270,
                invertX: false,
                invertY: true,
                fullscreen: true
            },
            'Screen_Projects': {
                offsetX: 0.13,
                offsetY: 0.6,
                scale: 2.100000000000001,
                rotation: -270,
                invertX: false,
                invertY: true,
                fullscreen: true
            },
            'Screen_Video': {
                rotation: 90,
                fullscreen: true
            }
        }

        // Load video after initialization
        this.createVideoTexture()
    }

    createVideoTexture() {
        this.videoElement = document.createElement('video')
        
        // Set up video element
        this.videoElement.crossOrigin = 'anonymous'
        this.videoElement.src = '/textures/screens/portfoliovideo.mp4'
        this.videoElement.loop = true
        this.videoElement.muted = true
        this.videoElement.playsInline = true
        
        // Add error handling
        this.videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e)
            console.error('Error state:', this.videoElement.error)
        })
        
        this.videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully')
            this.startVideo()
        })
        
        this.videoElement.addEventListener('canplaythrough', () => {
            console.log('Video can play through')
        })
        
        // Create video texture
        this.videoTexture = new THREE.VideoTexture(this.videoElement)
        this.videoTexture.needsUpdate = true
        
        // Update the states with video texture
        this.screens.states['Screen_Video'].textures.main = this.videoTexture
        this.screens.states['Screen_Video'].textures.video = this.videoTexture
        
        // Update the screen material if it already exists
        if (this.screens.screenMeshes['Screen_Video']) {
            this.screens.screenMeshes['Screen_Video'].material.map = this.videoTexture
            this.screens.screenMeshes['Screen_Video'].material.needsUpdate = true
        }
        
        // Load the video
        this.videoElement.load()
    }

    startVideo() {
        if (this.videoElement) {
            const playPromise = this.videoElement.play()
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Video playing')
                    this.isVideoPlaying = true
                }).catch(error => {
                    console.error('Error starting video:', error)
                })
            }
        }
    }

    applyScreenTransforms(child) {
        if (child.geometry) {
            const uvAttribute = child.geometry.attributes.uv
            if (uvAttribute) {
                const uv = uvAttribute.array
                
                // Store original UV coordinates
                child.userData.originalUV = new Float32Array(uv)
                
                // Get transform for this screen
                const transform = this.screenTransforms[child.name]
                
                if (transform) {
                    this.applyUVTransform(child, transform)
                }
                
                uvAttribute.needsUpdate = true
                child.geometry.computeBoundingSphere()
            }
        }
    }

    applyUVTransform(screen, transform) {
        const uvAttribute = screen.geometry.attributes.uv
        if (!uvAttribute) return
        
        const uv = uvAttribute.array
        const originalUV = screen.userData.originalUV
        
        for (let i = 0; i < uv.length; i += 2) {
            let u = originalUV[i]
            let v = originalUV[i + 1]
            
            // Apply rotation
            if (transform.rotation !== undefined && transform.rotation !== 0) {
                const angle = transform.rotation * Math.PI / 180
                const centerU = u - 0.5
                const centerV = v - 0.5
                
                const rotatedU = centerU * Math.cos(angle) - centerV * Math.sin(angle)
                const rotatedV = centerU * Math.sin(angle) + centerV * Math.cos(angle)
                
                u = rotatedU + 0.5
                v = rotatedV + 0.5
            }
            
            // Apply aspect ratio correction for 1920x1080 content
            if (transform.fullscreen) {
                const imageAspectRatio = 16 / 9
                const scaleU = imageAspectRatio / 1.0
                u = (u - 0.5) / scaleU + 0.5
            }
            
            // Apply scale (zoom)
            if (transform.scale !== undefined) {
                u = (u - 0.5) * transform.scale + 0.5
                v = (v - 0.5) * transform.scale + 0.5
            }
            
            // Apply offset
            if (transform.offsetX !== undefined) {
                u += transform.offsetX
            }
            if (transform.offsetY !== undefined) {
                v += transform.offsetY
            }
            
            // Apply inversion
            if (transform.invertX) {
                u = 1 - u
            }
            if (transform.invertY) {
                v = 1 - v
            }
            
            uv[i] = u
            uv[i + 1] = v
        }
        
        uvAttribute.needsUpdate = true
        screen.geometry.computeBoundingSphere()
    }

    // Method to export current UV values for debugging
    exportUVValues(screenName) {
        const transform = this.screenTransforms[screenName]
        if (!transform) return null
        
        const output = {
            screen: screenName,
            transform: { ...transform }
        }
        
        console.log('UV Transform Values:', JSON.stringify(output, null, 2))
        
        // Copy to clipboard
        navigator.clipboard.writeText(JSON.stringify(output, null, 2))
            .then(() => console.log('UV values copied to clipboard!'))
            .catch(() => console.log('Failed to copy to clipboard'))
        
        return output
    }

    update() {
        // Update video texture
        if (this.videoTexture) {
            this.videoTexture.needsUpdate = true
        }
    }
}