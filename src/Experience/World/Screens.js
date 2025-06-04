import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from 'gsap'
import ScreenInteraction from './ScreenInteraction.js'
import ScreenTextures from './ScreenTextures.js'
import ScreenUI from './ScreenUI.js'

export default class Screens {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.camera = this.experience.camera
        this.debug = this.experience.debug

        // Testing mode for positioning
        this.testingMode = false // Set to true to enable screen testing

        // STARTING POINT: Default ideal camera positions for each screen (only About and Credits adjusted for straight angles)
        this.idealCameraPositions = {
            "Screen_About": {
                "camera": { "x": -2.0, "y": 2.5, "z": 2.5 },
                "target": { "x": -5.5, "y": 2.5, "z": 2.5 }
            },
            "Screen_Projects": {
                "camera": { "x": -6.18, "y": 1.29, "z": 2.63 },
                "target": { "x": -6.30, "y": 1.29, "z": 11.46 }
            },
            "Screen_Credits": {
                "camera": { "x": -9.17, "y": 1.11, "z": 2.45 },
                "target": { "x": -3.98, "y": 1.1, "z": 2.36 }
            },
            "Screen_Video": {
                "camera": { "x": -2.80, "y": 1.58, "z": 1.03 },
                "target": { "x": -7.02, "y": 0.49, "z": 3.48 }
            }
        }

        this.currentTestScreen = null

        // Setup screens
        this.screenMeshes = {}
        this.activeScreen = null
        this.isTransitioning = false

        // Track current states for each screen
        this.states = {
            'Screen_About': {
                currentTab: 'main',
                textures: {
                    cover: this.resources.items.aboutcoverTexture,
                    main: this.resources.items.aboutMainTexture,
                    skills: this.resources.items.aboutSkillsTexture,
                    experience: this.resources.items.aboutExperienceTexture
                },
                inCoverMode: true // Start with covers
            },
            'Screen_Projects': {
                currentView: 'main',
                textures: {
                    cover: this.resources.items.projectscoverTexture,
                    main: this.resources.items.projectsMainTexture,
                    project1: this.resources.items.project1Texture,
                    project2: this.resources.items.project2Texture,
                    project3: this.resources.items.project3Texture,
                    project4: this.resources.items.project4Texture,
                    project5: this.resources.items.project5Texture,
                    project6: this.resources.items.project6Texture,
                    project7: this.resources.items.project7Texture,
                    project8: this.resources.items.project8Texture
                },
                inCoverMode: true // Start with covers
            },
            'Screen_Credits': {
                currentView: 'main',
                textures: {
                    cover: this.resources.items.creditscoverTexture,
                    main: this.resources.items.creditsTexture
                },
                inCoverMode: true // Start with covers
            },
            'Screen_Video': {
                currentView: 'main',
                textures: {
                    main: null, // Will be set after video loads
                    video: null  // Will be set after video loads
                }
            }
        }

        // Define clickable regions for each screen and state
        this.clickableRegions = {
            'Screen_About': {
                cover: [], // No regions on cover image, clicking anywhere enters the screen
                main: [
                    {
                        name: 'aboutTab',
                        bounds: { x1: 0.0, y1: 0.85, x2: 0.33, y2: 1.0 },
                        action: () => this.switchAboutTab('main')
                    },
                    {
                        name: 'experienceTab',
                        bounds: { x1: 0.33, y1: 0.85, x2: 0.67, y2: 1.0 },
                        action: () => this.switchAboutTab('experience')
                    },
                    {
                        name: 'skillsTab',
                        bounds: { x1: 0.67, y1: 0.85, x2: 1.0, y2: 1.0 },
                        action: () => this.switchAboutTab('skills')
                    },
                    // Social media/professional icons (shifted one position right)
                    {
                        name: 'linkedinIcon',
                        bounds: { x1: 0.14, y1: 0.15, x2: 0.19, y2: 0.22 },
                        action: () => window.open('https://www.linkedin.com/in/alex-saunders-665729238/', '_blank')
                    },
                    {
                        name: 'githubIcon',
                        bounds: { x1: 0.20, y1: 0.15, x2: 0.25, y2: 0.22 },
                        action: () => window.open('https://github.com/alxsaunders', '_blank')
                    },
                    {
                        name: 'portfolioIcon',
                        bounds: { x1: 0.26, y1: 0.15, x2: 0.31, y2: 0.22 },
                        action: () => window.open('https://future-move.weebly.com/', '_blank')
                    },
                    {
                        name: 'emailIcon',
                        bounds: { x1: 0.32, y1: 0.15, x2: 0.37, y2: 0.22 },
                        action: () => window.open('mailto:alexsaunders242@gmail.com', '_blank')
                    },
                    {
                        name: 'resumeIcon',
                        bounds: { x1: 0.38, y1: 0.15, x2: 0.43, y2: 0.22 },
                        action: () => window.open('/path/to/your-resume.pdf', '_blank')
                    }
                ],
                skills: [
                    {
                        name: 'aboutTab',
                        bounds: { x1: 0.0, y1: 0.85, x2: 0.33, y2: 1.0 },
                        action: () => this.switchAboutTab('main')
                    },
                    {
                        name: 'experienceTab',
                        bounds: { x1: 0.33, y1: 0.85, x2: 0.67, y2: 1.0 },
                        action: () => this.switchAboutTab('experience')
                    },
                    {
                        name: 'skillsTab',
                        bounds: { x1: 0.67, y1: 0.85, x2: 1.0, y2: 1.0 },
                        action: () => this.switchAboutTab('skills')
                    },
                    // Social media/professional icons
                    {
                        name: 'linkedinIcon',
                        bounds: { x1: 0.08, y1: 0.1, x2: 0.18, y2: 0.25 },
                        action: () => window.open('https://www.linkedin.com/in/alex-saunders-665729238/', '_blank')
                    },
                    {
                        name: 'githubIcon',
                        bounds: { x1: 0.20, y1: 0.1, x2: 0.30, y2: 0.25 },
                        action: () => window.open('https://github.com/alxsaunders', '_blank')
                    },
                    {
                        name: 'portfolioIcon',
                        bounds: { x1: 0.32, y1: 0.1, x2: 0.42, y2: 0.25 },
                        action: () => window.open('https://your-portfolio.com', '_blank')
                    },
                    {
                        name: 'emailIcon',
                        bounds: { x1: 0.44, y1: 0.1, x2: 0.54, y2: 0.25 },
                        action: () => window.open('mailto:alexsaunders242@gmail.com', '_blank')
                    },
                    {
                        name: 'resumeIcon',
                        bounds: { x1: 0.56, y1: 0.1, x2: 0.66, y2: 0.25 },
                        action: () => window.open('/path/to/your-resume.pdf', '_blank')
                    }
                ],
                experience: [
                    {
                        name: 'aboutTab',
                        bounds: { x1: 0.0, y1: 0.85, x2: 0.33, y2: 1.0 },
                        action: () => this.switchAboutTab('main')
                    },
                    {
                        name: 'experienceTab',
                        bounds: { x1: 0.33, y1: 0.85, x2: 0.67, y2: 1.0 },
                        action: () => this.switchAboutTab('experience')
                    },
                    {
                        name: 'skillsTab',
                        bounds: { x1: 0.67, y1: 0.85, x2: 1.0, y2: 1.0 },
                        action: () => this.switchAboutTab('skills')
                    },
                    // Social media/professional icons
                    {
                        name: 'linkedinIcon',
                        bounds: { x1: 0.08, y1: 0.1, x2: 0.18, y2: 0.25 },
                        action: () => window.open('https://www.linkedin.com/in/alex-saunders-665729238/', '_blank')
                    },
                    {
                        name: 'githubIcon',
                        bounds: { x1: 0.20, y1: 0.1, x2: 0.30, y2: 0.25 },
                        action: () => window.open('https://github.com/alxsaunders', '_blank')
                    },
                    {
                        name: 'portfolioIcon',
                        bounds: { x1: 0.32, y1: 0.1, x2: 0.42, y2: 0.25 },
                        action: () => window.open('https://your-portfolio.com', '_blank')
                    },
                    {
                        name: 'emailIcon',
                        bounds: { x1: 0.44, y1: 0.1, x2: 0.54, y2: 0.25 },
                        action: () => window.open('mailto:alexsaunders242@gmail.com', '_blank')
                    },
                    {
                        name: 'resumeIcon',
                        bounds: { x1: 0.56, y1: 0.1, x2: 0.66, y2: 0.25 },
                        action: () => window.open('/path/to/your-resume.pdf', '_blank')
                    }
                ]
            },
            'Screen_Projects': {
                cover: [], // No regions on cover image, clicking anywhere enters the screen
                main: [
                    // Top row project icons (improved bounds - slightly larger and better centered)
                    {
                        name: 'project1', // Future Move
                        bounds: { x1: 0.19, y1: 0.58, x2: 0.31, y2: 0.77 },
                        action: () => this.showProject('project1')
                    },
                    {
                        name: 'project2', // Air Invest
                        bounds: { x1: 0.36, y1: 0.58, x2: 0.47, y2: 0.77 },
                        action: () => this.showProject('project2')
                    },
                    {
                        name: 'project3', // Sound Sketch
                        bounds: { x1: 0.52, y1: 0.58, x2: 0.64, y2: 0.77 },
                        action: () => this.showProject('project3')
                    },
                    {
                        name: 'project4', // My Portfolio
                        bounds: { x1: 0.68, y1: 0.58, x2: 0.80, y2: 0.77 },
                        action: () => this.showProject('project4')
                    },
                    // Bottom row project icons
                    {
                        name: 'project5', // Nexus
                        bounds: { x1: 0.19, y1: 0.30, x2: 0.31, y2: 0.49 },
                        action: () => this.showProject('project5')
                    },
                    {
                        name: 'project6', // V & V
                        bounds: { x1: 0.35, y1: 0.30, x2: 0.48, y2: 0.49 },
                        action: () => this.showProject('project6')
                    },
                    {
                        name: 'project7', // Nearby Nexus
                        bounds: { x1: 0.51, y1: 0.30, x2: 0.64, y2: 0.49 },
                        action: () => this.showProject('project7')
                    },
                    {
                        name: 'project8', // Elevate
                        bounds: { x1: 0.68, y1: 0.30, x2: 0.80, y2: 0.49 },
                        action: () => this.showProject('project8')
                    }
                ]
            },
            'Screen_Credits': {
                cover: [], // No regions on cover image, clicking anywhere enters the screen
                main: []
            },
            'Screen_Video': {
                main: []
            }
        }

        // Project-specific URLs with actual links
        const projectLinks = {
            project1: { // Future Move
                website: 'https://future-move.weebly.com/',
                walkthrough: 'https://youtu.be/dwISjgpyiF8',
                github: 'https://github.com/alxsaunders/FutureMove'
            },
            project2: { // Air Invest
                website: 'https://airinvest.alex-island.com/',
                walkthrough: 'https://youtu.be/nqgECSueE0w',
                github: 'https://github.com/alxsaunders/AirInvest'
            },
            project3: { // Sound Sketch
                website: null, // No website for Sound Sketch
                walkthrough: 'https://youtu.be/U59bHKjl9wM',
                github: 'https://github.com/alxsaunders/SoundSketch'
            },
            project4: { // My Portfolio
                website: null, // No website for Portfolio
                walkthrough: 'https://youtu.be/yno0QPrQBys',
                github: 'https://github.com/alxsaunders/OfficialPortfolio'
            },
            project5: { // Nexus
                website: 'https://nexus.alex-island.com/',
                walkthrough: 'https://youtu.be/OXLXycR-zLk',
                github: 'https://github.com/Servbt/Nexus'
            },
            project6: { // V & V (Vines and Victuals)
                website: 'https://vandv.alex-island.com/',
                walkthrough: 'https://youtu.be/hGrBZGZ8bWQ',
                github: 'https://github.com/jshuaaaa/vines-and-victuals'
            },
            project7: { // Nearby Nexus
                website: null, // No website for Nearby Nexus
                walkthrough: 'https://youtu.be/2VKX64_egq4',
                github: 'https://github.com/alxsaunders/NearbyNexus'
            },
            project8: { // Elevate
                website: 'https://elevate.alex-island.com/',
                walkthrough: 'https://youtu.be/WAU9NXzVA6k',
                github: 'https://github.com/jshuaaaa/elevate'
            }
        }

        // Enhanced project detail screen clickable regions
        for(let i = 1; i <= 8; i++) {
            const projectKey = `project${i}`
            const links = projectLinks[projectKey]
            
            this.clickableRegions['Screen_Projects'][projectKey] = [
                // Back button (top-left blue circular button) - moved up
                {
                    name: 'backButton',
                    bounds: { x1: 0.01, y1: 0.71, x2: 0.22, y2: 0.94 },
                    action: () => this.showProjectMain()
                },
                
                // Website button - "WEBSITE" button (top button) - moved up
                {
                    name: 'websiteButton',
                    bounds: { x1: 0.52, y1: 0.65, x2: 0.85, y2: 0.75 },
                    action: () => {
                        if (links.website) {
                            window.open(links.website, '_blank')
                        } else {
                            console.log('No website available for this project')
                            // Optionally show a toast/notification that no website is available
                        }
                    }
                },
                
                // Walkthrough video button - "LINK TO WALKTHROUGH VIDEO" button (middle button) - moved up
                {
                    name: 'walkthroughButton',
                    bounds: { x1: 0.52, y1: 0.54, x2: 0.86, y2: 0.66 },
                    action: () => {
                        if (links.walkthrough) {
                            window.open(links.walkthrough, '_blank')
                        } else {
                            console.log('No walkthrough video available for this project')
                        }
                    }
                },
                
                // GitHub button - "GITHUB" button (bottom button) - moved up
                {
                    name: 'githubButton',
                    bounds: { x1: 0.53, y1: 0.45, x2: 0.84, y2: 0.57 },
                    action: () => window.open(links.github, '_blank')
                }
            ]
        }

        console.log('Enhanced project clickable regions setup with the following features:')
        console.log('- Back button (blue circular arrow)')
        console.log('- Website button (handles both available and N/A states)')
        console.log('- Walkthrough video button')
        console.log('- GitHub button') 
        console.log('- Screenshot image areas (optional interaction)')
        console.log('Project regions:', this.clickableRegions['Screen_Projects'])

        // Initialize sub-modules
        this.textureManager = new ScreenTextures(this)
        this.interactionManager = new ScreenInteraction(this)
        this.uiManager = new ScreenUI(this)

        // Setup
        this.setScreens()
    }

    setScreens() {
        // Find screens in the model
        this.resources.items.alxislandModel.scene.traverse((child) => {
            if(child.name.startsWith('Screen_')) {
                console.log('Found screen:', child.name)
                
                // Determine which texture to use initially
                let initialTexture;
                if (child.name === 'Screen_Video') {
                    // Video screen doesn't have cover mode
                    initialTexture = this.states[child.name]?.textures.main;
                } else {
                    // All other screens start with cover texture
                    initialTexture = this.states[child.name]?.textures.cover;
                }
                
                // Create material for screen using Standard material for good color balance
                // Updated material settings with brighter values for Credits screen
                let materialConfig = {
                    map: initialTexture,
                    transparent: true
                };

                // Configure materials based on screen type
                if (child.name === 'Screen_Projects') {
                    // Projects screen - bright and slightly reflective
                    materialConfig.color = 0xffffff;
                    materialConfig.roughness = 0.7;
                    materialConfig.metalness = 0.1;
                    materialConfig.emissive = 0x333333;
                    materialConfig.emissiveIntensity = 0.4;
                } else if (child.name === 'Screen_Credits') {
                    // Credits screen - make it brighter like Projects
                    materialConfig.color = 0xffffff;  // Changed from 0xcccccc to full white
                    materialConfig.roughness = 0.8;   // Slightly less rough than before
                    materialConfig.metalness = 0.05;  // Add slight metalness
                    materialConfig.emissive = 0x222222;  // Add emissive glow
                    materialConfig.emissiveIntensity = 0.3;  // Emissive intensity
                } else {
                    // Other screens (About, Video) - moderate brightness
                    materialConfig.color = 0xe6e6e6;  // Slightly brighter than before
                    materialConfig.roughness = 0.85;
                    materialConfig.metalness = 0.0;
                    materialConfig.emissive = 0x111111;
                    materialConfig.emissiveIntensity = 0.2;
                }
                
                const material = new THREE.MeshStandardMaterial(materialConfig)
                
                // Store original material for later
                child.userData.originalMaterial = child.material
                
                // Apply new material
                child.material = material
                
                // Store reference to screen
                this.screenMeshes[child.name] = child
                
                // Apply UV transforms
                this.textureManager.applyScreenTransforms(child)
            }
        })
    }

    focusScreen(screenMesh) {
        if(this.activeScreen === screenMesh) return
    
        this.isTransitioning = true
    
        // IMMEDIATELY disable controls to prevent any movement during transition
        this.camera.controls.enableRotate = false
        this.camera.controls.enableZoom = false
        this.camera.controls.enablePan = false
        
        // Store the current control target to ensure smooth transition
        const currentTarget = this.camera.controls.target.clone()
    
        // Show the exit button
        this.uiManager.showExitButton()
        
        // Check if we have a saved ideal position for this screen
        if (this.idealCameraPositions[screenMesh.name]) {
            const savedPosition = this.idealCameraPositions[screenMesh.name]
            
            // Use the saved position
            gsap.to(this.camera.instance.position, {
                duration: 1,
                x: savedPosition.camera.x,
                y: savedPosition.camera.y,
                z: savedPosition.camera.z,
                ease: "power2.inOut",
                onUpdate: () => {
                    // Force update controls during animation to prevent drift
                    this.camera.controls.update()
                },
                onComplete: () => {
                    this.isTransitioning = false
                    this.activeScreen = screenMesh
                    // Controls already disabled, just update one more time
                    this.camera.controls.update()
                }
            })
        
            gsap.to(this.camera.controls.target, {
                duration: 1,
                x: savedPosition.target.x,
                y: savedPosition.target.y,
                z: savedPosition.target.z,
                ease: "power2.inOut",
                onUpdate: () => {
                    // Force update controls during animation
                    this.camera.controls.update()
                }
            })
            
            return
        }
    
        // If no saved position, calculate one
        const targetPosition = new THREE.Vector3()
        screenMesh.getWorldPosition(targetPosition)
        
        const screenQuaternion = screenMesh.getWorldQuaternion(new THREE.Quaternion())
        const normal = new THREE.Vector3(0, 0, 1)
        normal.applyQuaternion(screenQuaternion)
        normal.normalize()
        
        const cameraPosition = targetPosition.clone()
        cameraPosition.sub(normal.multiplyScalar(2.0))
        
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            ease: "power2.inOut",
            onUpdate: () => {
                // Force update controls during animation to prevent drift
                this.camera.controls.update()
            },
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = screenMesh
                // Final update
                this.camera.controls.update()
            }
        })
    
        gsap.to(this.camera.controls.target, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut",
            onUpdate: () => {
                // Force update controls during animation
                this.camera.controls.update()
            }
        })
    }
    
    exitScreenView() {
        if (this.isTransitioning) return
        
        this.isTransitioning = true
        
        // Hide the exit button
        this.uiManager.hideExitButton()
        
        // Don't re-enable controls until animation is complete
        
        // Reset ALL screens to cover mode and reset their sub-navigation
        Object.keys(this.screenMeshes).forEach(screenName => {
            const screenState = this.states[screenName]
            const screenMesh = this.screenMeshes[screenName]
            
            if (screenState && screenMesh) {
                // Reset to cover mode
                if (screenState.hasOwnProperty('inCoverMode')) {
                    screenState.inCoverMode = true
                    screenMesh.material.map = screenState.textures.cover
                }
                
                // Reset sub-navigation to starting state
                if (screenName === 'Screen_About') {
                    screenState.currentTab = 'main'
                } else if (screenName === 'Screen_Projects') {
                    screenState.currentView = 'main'
                } else if (screenName === 'Screen_Credits') {
                    screenState.currentView = 'main'
                }
                
                screenMesh.material.needsUpdate = true
            }
        })
        
        // Reset camera to original position
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: -3.60,
            y: 3.35,
            z: -30.09,
            ease: "power2.inOut",
            onUpdate: () => {
                // Force update controls during animation
                this.camera.controls.update()
            },
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = null
                // Re-enable controls only after animation completes
                this.camera.controls.enableRotate = true
                this.camera.controls.enableZoom = true
                this.camera.controls.enablePan = true
                // Final update
                this.camera.controls.update()
            }
        })
        
        // Reset camera target
        gsap.to(this.camera.controls.target, {
            duration: 1,
            x: -3.23,
            y: 0.49,
            z: -1.49,
            ease: "power2.inOut",
            onUpdate: () => {
                this.camera.controls.update()
            }
        })
        
        console.log('All screens reset to cover mode with fresh start state')
    }
    
    // Helper method to lock camera at exact position
    lockCameraPosition() {
        if (this.activeScreen && this.idealCameraPositions[this.activeScreen.name]) {
            const savedPosition = this.idealCameraPositions[this.activeScreen.name]
            
            // Force camera to exact position (prevents any floating point drift)
            this.camera.instance.position.set(
                savedPosition.camera.x,
                savedPosition.camera.y,
                savedPosition.camera.z
            )
            
            this.camera.controls.target.set(
                savedPosition.target.x,
                savedPosition.target.y,
                savedPosition.target.z
            )
            
            this.camera.controls.update()
        }
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
        // Lock camera position if a screen is active and not transitioning
        if (this.activeScreen && !this.isTransitioning) {
            this.lockCameraPosition()
        }
        
        this.interactionManager.update()
        this.textureManager.update()
        // this.uiManager.updateCameraInfo() // COMMENTED OUT
    }
}