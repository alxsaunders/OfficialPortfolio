import * as THREE from 'three'
import gsap from 'gsap'

export default class ScreenInteraction {
    constructor(screensManager) {
        this.screens = screensManager
        this.camera = screensManager.camera
        
        // Raycaster setup
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        // Custom cursor setup
        this.setupCustomCursor()
        
        this.setupInteraction()
    }

    setupCustomCursor() {
        // Create custom cursor element
        this.cursorElement = document.createElement('div')
        this.cursorElement.className = 'custom-cursor'
        document.body.appendChild(this.cursorElement)
        
        // Add class to body to hide default cursor
        document.body.classList.add('custom-cursor-active')
        
        // Track mouse position for cursor
        this.cursorPosition = { x: 0, y: 0 }
        
        window.addEventListener('mousemove', (event) => {
            this.cursorPosition.x = event.clientX
            this.cursorPosition.y = event.clientY
            this.cursorElement.style.left = this.cursorPosition.x + 'px'
            this.cursorElement.style.top = this.cursorPosition.y + 'px'
        })
        
        // Handle click animation
        window.addEventListener('mousedown', () => {
            this.cursorElement.classList.add('clicked')
        })
        
        window.addEventListener('mouseup', () => {
            this.cursorElement.classList.remove('clicked')
        })
    }

    setupInteraction() {
        // Click event listener
        window.addEventListener('click', (event) => {
            // Skip if we're in testing mode and clicked on UI
            if (this.screens.testingMode && event.target.closest('#screen-testing-panel')) {
                return
            }
            
            // Calculate mouse position
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

            // Update raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera.instance)

            // Check intersections with screens
            const intersects = this.raycaster.intersectObjects(
                Object.values(this.screens.screenMeshes)
            )

            if(intersects.length > 0) {
                const intersect = intersects[0]
                const screenMesh = intersect.object
                this.handleScreenClick(screenMesh, intersect)
            }
        })

        // Hover effect
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        })

        // Add escape key listener for exiting screen view
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.screens.activeScreen) {
                this.screens.exitScreenView()
            }
        })
    }

    handleScreenClick(screenMesh, intersect) {
        if(this.screens.isTransitioning) return

        const screenState = this.screens.states[screenMesh.name]
        
        // Handle cover mode for non-video screens
        if (screenState && screenState.hasOwnProperty('inCoverMode') && screenState.inCoverMode) {
            // If in cover mode, switch to content mode and reset to starting state
            screenState.inCoverMode = false
            
            // Reset each screen to its starting sub-navigation state
            if (screenMesh.name === 'Screen_About') {
                screenState.currentTab = 'experience'  // Start at experience tab
                console.log('About screen currentTab set to:', screenState.currentTab)
            } else if (screenMesh.name === 'Screen_Projects') {
                screenState.currentView = 'main'
            } else if (screenMesh.name === 'Screen_Credits') {
                screenState.currentView = 'main'
            }
            
            // Transition from cover to main content
            gsap.to(screenMesh.material, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    // Load the appropriate starting texture based on screen type
                    if (screenMesh.name === 'Screen_About') {
                        console.log('Loading About screen with EXPERIENCE tab')
                        screenMesh.material.map = screenState.textures.experience
                    } else {
                        screenMesh.material.map = screenState.textures.main
                    }
                    screenMesh.material.needsUpdate = true
                    gsap.to(screenMesh.material, {
                        opacity: 1,
                        duration: 0.3
                    })
                }
            })
            
            // Focus the screen after switching from cover
            this.screens.focusScreen(screenMesh)
            return
        }
        
        // If clicking on the video screen, open YouTube
        if (screenMesh.name === 'Screen_Video') {
            window.open('https://youtu.be/pcC-w-0Znsg', '_blank')
            return
        }

        const currentView = screenState ? screenState.currentView || screenState.currentTab : null
        
        // Get UV coordinates of click
        const uv = intersect.uv
        
        // Get clickable regions for current screen and state
        const regions = this.screens.clickableRegions[screenMesh.name]?.[currentView] || []
        
        // Debug logging
        console.log('Screen clicked:', screenMesh.name)
        console.log('Current view:', currentView)
        console.log('Available regions:', regions.length)
        console.log('Click UV coordinates:', uv)
        
        // Check if click is within any clickable region
        for(const region of regions) {
            console.log(`Checking region ${region.name}:`, region.bounds)
            if(uv.x >= region.bounds.x1 && uv.x <= region.bounds.x2 && 
               uv.y >= region.bounds.y1 && uv.y <= region.bounds.y2) {
                console.log(`Region ${region.name} clicked!`)
                region.action()
                return
            }
        }

        // If no region was clicked, handle screen focus
        this.screens.focusScreen(screenMesh)
    }

    update() {
        // Testing mode doesn't need hover effects
        if (this.screens.testingMode) return
        
        // Hover effect
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.raycaster.intersectObjects(
            Object.values(this.screens.screenMeshes)
        )

        // Reset cursor classes and all screens
        this.cursorElement.classList.remove('hovering-screen', 'hovering-clickable')
        Object.values(this.screens.screenMeshes).forEach(screen => {
            if(screen !== this.screens.activeScreen) {
                screen.material.opacity = 1
            }
        })

        // Handle hover effects
        if(intersects.length > 0 && !this.screens.isTransitioning) {
            const intersect = intersects[0]
            const screenMesh = intersect.object
            const screenState = this.screens.states[screenMesh.name]
            
            // Show hovering-screen cursor state
            this.cursorElement.classList.add('hovering-screen')
            
            // Only check clickable regions if not in cover mode
            if (screenState && (!screenState.hasOwnProperty('inCoverMode') || !screenState.inCoverMode)) {
                const currentView = screenState.currentView || screenState.currentTab
                
                // Get UV coordinates
                const uv = intersect.uv
                
                // Check if hovering over clickable region
                const regions = this.screens.clickableRegions[screenMesh.name]?.[currentView] || []
                for(const region of regions) {
                    if(uv.x >= region.bounds.x1 && uv.x <= region.bounds.x2 && 
                       uv.y >= region.bounds.y1 && uv.y <= region.bounds.y2) {
                        // Show hovering-clickable cursor state
                        this.cursorElement.classList.remove('hovering-screen')
                        this.cursorElement.classList.add('hovering-clickable')
                        return
                    }
                }
            }

            // Highlight screen if not active
            if(screenMesh !== this.screens.activeScreen) {
                screenMesh.material.opacity = 0.8
            }
        }
    }
}