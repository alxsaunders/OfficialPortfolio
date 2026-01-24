// LoadingScreen.js
import gsap from 'gsap'

export default class LoadingScreen {
    constructor() {
        this.experience = window.experience
        
        // IMMEDIATELY hide UI elements before anything else
        this.hiddenElements = []
        this.hideUIElementsImmediately()
        
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
        this.minLoadingTime = 2000 // 2 seconds minimum
        this.startTime = Date.now()
        
        // Create loading screen elements
        this.createLoadingScreen()
        
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
        // Create loading screen container with blurred background
        this.loadingContainer = document.createElement('div')
        this.loadingContainer.className = 'loading-screen'
        this.loadingContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('/textures/portfolio-loading-blur.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: opacity 0.5s ease;
        `
        
        // Create simple CSS spinner (no Three.js - super smooth!)
        this.spinner = document.createElement('div')
        this.spinner.className = 'loading-spinner'
        this.spinner.style.cssText = `
            width: 80px;
            height: 80px;
            border: 4px solid rgba(255, 255, 255, 0.2);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `
        this.loadingContainer.appendChild(this.spinner)
        
        // Add CSS animation
        const style = document.createElement('style')
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `
        document.head.appendChild(style)
        
        // Add to body
        document.body.appendChild(this.loadingContainer)
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
        })
        
        this.experience.resources.on('ready', () => {
            this.loadingProgress = 100
            this.checkLoadingComplete()
        })
    }
    
    checkLoadingComplete() {
        const elapsedTime = Date.now() - this.startTime
        const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime)
        
        // Wait for minimum loading time then auto-hide
        setTimeout(() => {
            this.hideLoadingScreen()
        }, remainingTime)
    }
    
    hideLoadingScreen() {
        this.isLoading = false
        
        // Show UI elements immediately (don't wait for loading screen to finish)
        this.showUIElements()
        
        // Slower, more dramatic fade out (1.2 seconds)
        gsap.to(this.loadingContainer.style, {
            opacity: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingContainer.remove()
                
                // Dispatch event that loading is complete
                window.dispatchEvent(new Event('loadingComplete'))
            }
        })
    }
    
    hideUIElementsImmediately() {
        // Immediately hide UI elements with inline styles (no GSAP delay)
        const uiSelectors = [
            '.sidebar',
            '.navigation',
            '.menu',
            '.controls',
            '.ui-container',
            'nav',
            'aside'
        ]
        
        uiSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector)
            elements.forEach(el => {
                el.style.opacity = '0'
                el.style.pointerEvents = 'none'
                el.style.visibility = 'hidden'
                this.hiddenElements.push(el)
            })
        })
    }
    
    showUIElements() {
        // Fade in UI elements quickly
        if (this.hiddenElements && this.hiddenElements.length > 0) {
            this.hiddenElements.forEach((el, index) => {
                el.style.visibility = 'visible' // Restore visibility immediately
                gsap.to(el, {
                    opacity: 1,
                    duration: 0.4,
                    delay: 0,
                    ease: "power2.out",
                    onComplete: () => {
                        el.style.pointerEvents = 'auto'
                    }
                })
            })
        }
    }
}