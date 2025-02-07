import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from 'gsap'

export default class Screens {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        // Setup screens
        this.screenMeshes = {}
        this.activeScreen = null
        this.isTransitioning = false

        // Track current states for each screen
        this.states = {
            'Screen_About': {
                currentTab: 'main',
                textures: {
                    main: this.resources.items.aboutMainTexture,
                    skills: this.resources.items.aboutSkillsTexture,
                    experience: this.resources.items.aboutExperienceTexture
                }
            },
            'Screen_Projects': {
                currentView: 'main',
                textures: {
                    main: this.resources.items.projectsMainTexture,
                    project1: this.resources.items.project1Texture,
                    project2: this.resources.items.project2Texture,
                    project3: this.resources.items.project3Texture,
                    project4: this.resources.items.project4Texture,
                    project5: this.resources.items.project5Texture,
                    project6: this.resources.items.project6Texture,
                    project7: this.resources.items.project7Texture,
                    project8: this.resources.items.project8Texture
                }
            }
        }

        // Define clickable regions for each screen and state
        this.clickableRegions = {
            'Screen_About': {
                main: [
                    {
                        name: 'skillsTab',
                        bounds: { x1: 0.3, y1: 0.9, x2: 0.4, y2: 1.0 },
                        action: () => this.switchAboutTab('skills')
                    },
                    {
                        name: 'experienceTab',
                        bounds: { x1: 0.5, y1: 0.9, x2: 0.6, y2: 1.0 },
                        action: () => this.switchAboutTab('experience')
                    }
                ],
                skills: [
                    {
                        name: 'mainTab',
                        bounds: { x1: 0.1, y1: 0.9, x2: 0.2, y2: 1.0 },
                        action: () => this.switchAboutTab('main')
                    },
                    {
                        name: 'experienceTab',
                        bounds: { x1: 0.5, y1: 0.9, x2: 0.6, y2: 1.0 },
                        action: () => this.switchAboutTab('experience')
                    }
                ],
                experience: [
                    {
                        name: 'mainTab',
                        bounds: { x1: 0.1, y1: 0.9, x2: 0.2, y2: 1.0 },
                        action: () => this.switchAboutTab('main')
                    },
                    {
                        name: 'skillsTab',
                        bounds: { x1: 0.3, y1: 0.9, x2: 0.4, y2: 1.0 },
                        action: () => this.switchAboutTab('skills')
                    }
                ]
            },
            'Screen_Projects': {
                main: [
                    {
                        name: 'project1',
                        bounds: { x1: 0.1, y1: 0.1, x2: 0.3, y2: 0.3 },
                        action: () => this.showProject('project1')
                    },
                    {
                        name: 'project2',
                        bounds: { x1: 0.35, y1: 0.1, x2: 0.55, y2: 0.3 },
                        action: () => this.showProject('project2')
                    },
                    // Add the rest of the projects with proper UV coordinates
                    {
                        name: 'project3',
                        bounds: { x1: 0.6, y1: 0.1, x2: 0.8, y2: 0.3 },
                        action: () => this.showProject('project3')
                    },
                    // Row 2
                    {
                        name: 'project4',
                        bounds: { x1: 0.1, y1: 0.4, x2: 0.3, y2: 0.6 },
                        action: () => this.showProject('project4')
                    },
                    {
                        name: 'project5',
                        bounds: { x1: 0.35, y1: 0.4, x2: 0.55, y2: 0.6 },
                        action: () => this.showProject('project5')
                    },
                    {
                        name: 'project6',
                        bounds: { x1: 0.6, y1: 0.4, x2: 0.8, y2: 0.6 },
                        action: () => this.showProject('project6')
                    },
                    // Row 3
                    {
                        name: 'project7',
                        bounds: { x1: 0.1, y1: 0.7, x2: 0.3, y2: 0.9 },
                        action: () => this.showProject('project7')
                    },
                    {
                        name: 'project8',
                        bounds: { x1: 0.35, y1: 0.7, x2: 0.55, y2: 0.9 },
                        action: () => this.showProject('project8')
                    }
                ]
            }
        }

        // Add back button regions for each project page
        for(let i = 1; i <= 8; i++) {
            this.clickableRegions['Screen_Projects'][`project${i}`] = [
                {
                    name: 'backButton',
                    bounds: { x1: 0.1, y1: 0.9, x2: 0.2, y2: 1.0 },
                    action: () => this.showProjectMain()
                }
            ]
        }

        // Setup
        this.setScreens()
        this.setupInteraction()
    }

    setScreens() {
        // Find screens in the model
        this.resources.items.alxislandModel.scene.traverse((child) => {
            if(child.name.startsWith('Screen_')) {
                console.log('Found screen:', child.name)
                
                // Create material for screen
                const material = new THREE.MeshBasicMaterial({
                    map: this.states[child.name]?.textures.main || this.resources.items.creditsTexture,
                    transparent: true
                })

                // Store original material for later
                child.userData.originalMaterial = child.material
                
                // Apply new material
                child.material = material
                
                // Store reference to screen
                this.screenMeshes[child.name] = child
            }
        })
    }

    setupInteraction() {
        // Raycaster setup
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        // Click event listener
        window.addEventListener('click', (event) => {
            // Calculate mouse position
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

            // Update raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera.instance)

            // Check intersections with screens
            const intersects = this.raycaster.intersectObjects(
                Object.values(this.screenMeshes)
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
    }

    handleScreenClick(screenMesh, intersect) {
        if(this.isTransitioning) return

        const screenState = this.states[screenMesh.name]
        const currentView = screenState ? screenState.currentView || screenState.currentTab : null
        
        // Get UV coordinates of click
        const uv = intersect.uv
        
        // Get clickable regions for current screen and state
        const regions = this.clickableRegions[screenMesh.name]?.[currentView] || []
        
        // Check if click is within any clickable region
        for(const region of regions) {
            if(uv.x >= region.bounds.x1 && uv.x <= region.bounds.x2 && 
               uv.y >= region.bounds.y1 && uv.y <= region.bounds.y2) {
                region.action()
                return
            }
        }

        // If no region was clicked, handle screen focus
        this.focusScreen(screenMesh)
    }

    focusScreen(screenMesh) {
        if(this.activeScreen === screenMesh) return

        this.isTransitioning = true

        // Camera animation to focus on clicked screen
        const targetPosition = new THREE.Vector3()
        screenMesh.getWorldPosition(targetPosition)
        
        // Offset camera slightly
        targetPosition.add(new THREE.Vector3(0, 0, 2))

        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = screenMesh
            }
        })

        // Look at screen center
        gsap.to(this.camera.controls.target, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z - 2
        })
    }

    switchAboutTab(tab) {
        const screenState = this.states['Screen_About']
        const screen = this.screenMeshes['Screen_About']
        
        gsap.to(screen.material, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                screen.material.map = screenState.textures[tab]
                gsap.to(screen.material, {
                    opacity: 1,
                    duration: 0.3
                })
            }
        })
        
        screenState.currentTab = tab
    }

    showProject(projectId) {
        const screenState = this.states['Screen_Projects']
        const screen = this.screenMeshes['Screen_Projects']
        
        gsap.to(screen.material, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                screen.material.map = screenState.textures[projectId]
                gsap.to(screen.material, {
                    opacity: 1,
                    duration: 0.3
                })
            }
        })
        
        screenState.currentView = projectId
    }

    showProjectMain() {
        const screenState = this.states['Screen_Projects']
        const screen = this.screenMeshes['Screen_Projects']
        
        gsap.to(screen.material, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                screen.material.map = screenState.textures.main
                gsap.to(screen.material, {
                    opacity: 1,
                    duration: 0.3
                })
            }
        })
        
        screenState.currentView = 'main'
    }

    update() {
        // Hover effect
        this.raycaster.setFromCamera(this.mouse, this.camera.instance)
        const intersects = this.raycaster.intersectObjects(
            Object.values(this.screenMeshes)
        )

        // Reset cursor and all screens
        document.body.style.cursor = 'default'
        Object.values(this.screenMeshes).forEach(screen => {
            if(screen !== this.activeScreen) {
                screen.material.opacity = 1
            }
        })

        // Handle hover effects
        if(intersects.length > 0 && !this.isTransitioning) {
            const intersect = intersects[0]
            const screenMesh = intersect.object
            const screenState = this.states[screenMesh.name]
            const currentView = screenState ? screenState.currentView || screenState.currentTab : null
            
            // Get UV coordinates
            const uv = intersect.uv
            
            // Check if hovering over clickable region
            const regions = this.clickableRegions[screenMesh.name]?.[currentView] || []
            for(const region of regions) {
                if(uv.x >= region.bounds.x1 && uv.x <= region.bounds.x2 && 
                   uv.y >= region.bounds.y1 && uv.y <= region.bounds.y2) {
                    document.body.style.cursor = 'pointer'
                    return
                }
            }

            // Highlight screen if not active
            if(screenMesh !== this.activeScreen) {
                screenMesh.material.opacity = 0.8
            }
        }
    }
}