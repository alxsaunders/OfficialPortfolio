// LoadingScreen.js
import * as THREE from 'three'
import gsap from 'gsap'

export default class LoadingScreen {
    constructor() {
        this.experience = window.experience
        
        // Check if user is on mobile device
        this.isMobile = this.detectMobile()
        
        // If mobile, redirect immediately
        if (this.isMobile) {
            this.redirectToMobile()
            return
        }
        
        // Continue with normal loading screen for desktop
        this.isLoading = true
        this.loadingProgress = 0
        this.minLoadingTime = 5000 // 5 seconds minimum
        this.startTime = Date.now()
        
        // Create loading screen elements
        this.createLoadingScreen()
        this.createScene()
        this.createSimpleShape()
        
        // Start animation immediately
        this.animate()
        
        // Track resource loading after a delay
        setTimeout(() => {
            this.setupLoadingTracking()
        }, 100)
    }
    
    detectMobile() {
        // Multiple methods to detect mobile devices
        const userAgent = navigator.userAgent || navigator.vendor || window.opera
        
        // Check user agent
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
        const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase())
        
        // Check screen size (common mobile breakpoint)
        const isMobileScreen = window.innerWidth <= 768
        
        // Check touch capability
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
        
        // Check orientation API (mobile-specific)
        const hasOrientationAPI = typeof window.orientation !== 'undefined'
        
        // Return true if any mobile indicator is present
        return isMobileUserAgent || (isMobileScreen && isTouchDevice) || hasOrientationAPI
    }
    
    redirectToMobile() {
        // Create a simple redirect screen
        const redirectContainer = document.createElement('div')
        redirectContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        `
        
        // Add redirect message
        const message = document.createElement('div')
        message.innerHTML = `
            <h2 style="margin-bottom: 20px; font-weight: 300; font-size: 24px;">Mobile Detected</h2>
            <p style="margin-bottom: 30px; font-size: 16px; opacity: 0.8;">Redirecting to mobile-optimized version...</p>
            <div style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        `
        
        redirectContainer.appendChild(message)
        document.body.appendChild(redirectContainer)
        
        // Add CSS animation for spinner
        const style = document.createElement('style')
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `
        document.head.appendChild(style)
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'https://alxsaunders.github.io/2D-Portfolio/'
        }, 1500)
    }
    
    createLoadingScreen() {
        // Create loading screen container
        this.loadingContainer = document.createElement('div')
        this.loadingContainer.className = 'loading-screen'
        this.loadingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: opacity 0.5s ease;
        `
        
        // Create canvas for 3D model
        this.canvas = document.createElement('canvas')
        this.canvas.className = 'loading-canvas'
        this.canvas.style.cssText = `
            width: 300px;
            height: 300px;
            margin-bottom: 40px;
        `
        this.loadingContainer.appendChild(this.canvas)
        
        // Create loading text
        this.loadingText = document.createElement('div')
        this.loadingText.className = 'loading-text'
        this.loadingText.innerHTML = 'Loading<span class="dots">...</span>'
        this.loadingText.style.cssText = `
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 24px;
            font-weight: 300;
            letter-spacing: 2px;
            margin-bottom: 20px;
        `
        this.loadingContainer.appendChild(this.loadingText)
        
        // Create progress bar
        this.progressBarContainer = document.createElement('div')
        this.progressBarContainer.style.cssText = `
            width: 300px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 40px;
        `
        
        this.progressBar = document.createElement('div')
        this.progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #00aaff, #0066cc);
            border-radius: 2px;
            transition: width 0.3s ease;
        `
        this.progressBarContainer.appendChild(this.progressBar)
        this.loadingContainer.appendChild(this.progressBarContainer)
        
        // Create enter button (hidden initially)
        this.enterButton = document.createElement('button')
        this.enterButton.textContent = 'ENTER'
        this.enterButton.className = 'enter-button'
        this.enterButton.style.cssText = `
            padding: 15px 40px;
            background: transparent;
            color: white;
            border: 2px solid white;
            border-radius: 30px;
            font-size: 18px;
            font-weight: 500;
            letter-spacing: 3px;
            cursor: pointer;
            opacity: 0;
            pointer-events: none;
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        `
        
        // Hover effect
        this.enterButton.addEventListener('mouseover', () => {
            this.enterButton.style.background = 'white'
            this.enterButton.style.color = 'black'
            this.enterButton.style.transform = 'scale(1.05)'
        })
        
        this.enterButton.addEventListener('mouseout', () => {
            this.enterButton.style.background = 'transparent'
            this.enterButton.style.color = 'white'
            this.enterButton.style.transform = 'scale(1)'
        })
        
        this.enterButton.addEventListener('click', () => {
            this.hideLoadingScreen()
        })
        
        this.loadingContainer.appendChild(this.enterButton)
        
        // Add to body
        document.body.appendChild(this.loadingContainer)
        
        // Animate dots
        this.animateDots()
    }
    
    createScene() {
        // Create separate scene for loading screen
        this.scene = new THREE.Scene()
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            this.canvas.width / this.canvas.height,
            0.1,
            1000
        )
        this.camera.position.z = 5
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true // Transparent background
        })
        this.renderer.setSize(this.canvas.width, this.canvas.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        this.scene.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 5, 5)
        this.scene.add(directionalLight)
    }
    
    createSimpleShape() {
        // Create a simple circular loader
        const radius = 1.5
        const segments = 32
        
        // Create the ring geometry
        const geometry = new THREE.TorusGeometry(radius, 0.1, 8, segments)
        
        // Create gradient material
        const material = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.8
        })
        
        this.ring = new THREE.Mesh(geometry, material)
        this.scene.add(this.ring)
        
        // Create a loading indicator (small sphere that goes around)
        const indicatorGeometry = new THREE.SphereGeometry(0.15, 16, 8)
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            emissive: 0xffffff
        })
        
        this.indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
        this.indicator.position.x = radius
        this.scene.add(this.indicator)
    }
    
    setupLoadingTracking() {
        // Check if resources exist
        if (!this.experience.resources) {
            // If resources don't exist yet, check again in 100ms
            setTimeout(() => this.setupLoadingTracking(), 100)
            return
        }
        
        // Track resource loading progress
        this.experience.resources.on('progress', (loaded, total) => {
            this.loadingProgress = (loaded / total) * 100
            this.updateProgressBar()
        })
        
        this.experience.resources.on('ready', () => {
            this.loadingProgress = 100
            this.updateProgressBar()
            this.checkLoadingComplete()
        })
    }
    
    updateProgressBar() {
        gsap.to(this.progressBar.style, {
            width: `${this.loadingProgress}%`,
            duration: 0.3,
            ease: "power2.out"
        })
    }
    
    checkLoadingComplete() {
        const elapsedTime = Date.now() - this.startTime
        const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime)
        
        // Wait for minimum loading time
        setTimeout(() => {
            this.showEnterButton()
        }, remainingTime)
    }
    
    showEnterButton() {
        // Stop the animation
        this.isLoading = false
        
        // Hide loading text, progress bar, and canvas
        gsap.to([this.loadingText, this.progressBarContainer, this.canvas], {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.loadingText.style.display = 'none'
                this.progressBarContainer.style.display = 'none'
                this.canvas.style.display = 'none'
            }
        })
        
        // Show enter button
        gsap.to(this.enterButton.style, {
            opacity: 1,
            duration: 0.5,
            delay: 0.3,
            onComplete: () => {
                this.enterButton.style.pointerEvents = 'auto'
            }
        })
    }
    
    hideLoadingScreen() {
        this.isLoading = false
        
        // Simple fade out
        gsap.to(this.loadingContainer.style, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingContainer.remove()
                this.destroy()
                
                // Dispatch event that loading is complete
                window.dispatchEvent(new Event('loadingComplete'))
            }
        })
    }
    
    animateDots() {
        const dotsElement = this.loadingText.querySelector('.dots')
        let dots = ''
        let count = 0
        
        this.dotsInterval = setInterval(() => {
            count = (count + 1) % 4
            dots = '.'.repeat(count)
            dotsElement.textContent = dots.padEnd(3, ' ')
        }, 500)
    }
    
    animate() {
        if (!this.isLoading) return
        
        requestAnimationFrame(() => this.animate())
        
        // Animate the indicator going around the circle
        if (this.indicator) {
            const time = Date.now() * 0.002
            this.indicator.position.x = Math.cos(time) * 1.5
            this.indicator.position.z = Math.sin(time) * 1.5
        }
        
        // Render
        this.renderer.render(this.scene, this.camera)
    }
    
    destroy() {
        // Clean up
        if (this.dotsInterval) {
            clearInterval(this.dotsInterval)
        }
        
        if (this.renderer) {
            this.renderer.dispose()
        }
        
        // Clean up ring
        if (this.ring) {
            this.scene.remove(this.ring)
            if (this.ring.geometry) this.ring.geometry.dispose()
            if (this.ring.material) this.ring.material.dispose()
        }
        
        // Clean up indicator
        if (this.indicator) {
            this.scene.remove(this.indicator)
            if (this.indicator.geometry) this.indicator.geometry.dispose()
            if (this.indicator.material) this.indicator.material.dispose()
        }
    }
}