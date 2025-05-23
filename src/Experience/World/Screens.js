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

        // STARTING POINT: Default ideal camera positions for each screen
        this.idealCameraPositions = {
            "Screen_About": {
                "camera": { "x": -0.34, "y": 2.53, "z": 2.43 },
                "target": { "x": -5.87, "y": 2.48, "z": 2.22 }
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
                inCoverMode: true
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
                inCoverMode: true
            },
            'Screen_Credits': {
                currentView: 'main',
                textures: {
                    cover: this.resources.items.creditscoverTexture,
                    main: this.resources.items.creditsTexture
                },
                inCoverMode: true
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
                    {
                        name: 'project3',
                        bounds: { x1: 0.6, y1: 0.1, x2: 0.8, y2: 0.3 },
                        action: () => this.showProject('project3')
                    },
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
            },
            'Screen_Credits': {
                cover: [], // No regions on cover image, clicking anywhere enters the screen
                main: []
            },
            'Screen_Video': {
                main: []
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
                
                // Create material for screen with reduced brightness
                // About screen gets extra darkening (10% darker)
                let materialColor = 0x888888 // Default darkening for all screens
                if (child.name === 'Screen_About') {
                    materialColor = 0x7A7A7A // 10% darker than default
                }
                
                const material = new THREE.MeshBasicMaterial({
                    map: initialTexture,
                    transparent: true,
                    color: materialColor
                })
                
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
                onComplete: () => {
                    this.isTransitioning = false
                    this.activeScreen = screenMesh
                    this.camera.controls.enableRotate = false
                    this.camera.controls.enableZoom = false
                    this.camera.controls.enablePan = false
                }
            })
        
            gsap.to(this.camera.controls.target, {
                duration: 1,
                x: savedPosition.target.x,
                y: savedPosition.target.y,
                z: savedPosition.target.z,
                ease: "power2.inOut"
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
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = screenMesh
                this.camera.controls.enableRotate = false
                this.camera.controls.enableZoom = false
                this.camera.controls.enablePan = false
            }
        })
    
        gsap.to(this.camera.controls.target, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut"
        })
    }
    
    exitScreenView() {
        if (this.isTransitioning) return
        
        this.isTransitioning = true
        
        // Hide the exit button
        this.uiManager.hideExitButton()
        
        // Reset screen to cover mode if applicable
        if (this.activeScreen) {
            const screenName = this.activeScreen.name
            const screenState = this.states[screenName]
            
            if (screenState && screenState.hasOwnProperty('inCoverMode')) {
                screenState.inCoverMode = true
                
                // Transition from content to cover
                gsap.to(this.activeScreen.material, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        this.activeScreen.material.map = screenState.textures.cover
                        gsap.to(this.activeScreen.material, {
                            opacity: 1,
                            duration: 0.3
                        })
                    }
                })
            }
        }
        
        // Reset camera to original position
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: -3.60,
            y: 3.35,
            z: -30.09,
            ease: "power2.inOut",
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = null
                this.camera.controls.enableRotate = true
                this.camera.controls.enableZoom = true
                this.camera.controls.enablePan = true
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
        this.interactionManager.update()
        this.textureManager.update()
    }
}