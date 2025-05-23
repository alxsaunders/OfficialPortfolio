import * as THREE from 'three'
import gsap from 'gsap'

export default class ScreenInteraction {
    constructor(screensManager) {
        this.screens = screensManager
        this.camera = screensManager.camera
        
        // Raycaster setup
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        this.setupInteraction()
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
            // If in cover mode, switch to content mode and focus the screen
            screenState.inCoverMode = false
            
            // Transition from cover to content
            gsap.to(screenMesh.material, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    // Set appropriate texture based on current tab/view
                    const currentView = screenState.currentView || screenState.currentTab || 'main'
                    screenMesh.material.map = screenState.textures[currentView]
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
        
        // Check if click is within any clickable region
        for(const region of regions) {
            if(uv.x >= region.bounds.x1 && uv.x <= region.bounds.x2 && 
               uv.y >= region.bounds.y1 && uv.y <= region.bounds.y2) {
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

        // Reset cursor and all screens
        document.body.style.cursor = 'default'
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
            
            // Show pointer cursor for any screen hover
            document.body.style.cursor = 'pointer'
            
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