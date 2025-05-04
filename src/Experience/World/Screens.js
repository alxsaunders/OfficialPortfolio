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

        // Create the exit button
        this.createExitButton()

        // Initialize video properties
        this.videoElement = null
        this.isVideoPlaying = false
        this.videoTexture = null

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
            },
            'Screen_Credits': {
                currentView: 'main',
                textures: {
                    main: this.resources.items.creditsTexture
                }
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

        // Setup
        this.setScreens()
        this.setupInteraction()
        
        // Load video after screens are set up
        this.createVideoTexture()
        
        // Create debug UI panel
        this.createDebugUI()
        
        // If in testing mode, create testing UI
        if (this.testingMode) {
            this.createTestingUI()
        }
    }

    createDebugUI() {
        // Create debug panel
        this.debugPanel = document.createElement('div')
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            width: 340px;
            z-index: 1001;
            display: none;
            flex-direction: column;
            gap: 10px;
            max-height: 90vh;
            overflow-y: auto;
        `
        
        // Create title
        const title = document.createElement('h3')
        title.textContent = 'Screen Adjustment Panel'
        title.style.margin = '0 0 10px 0'
        this.debugPanel.appendChild(title)
        
        // Create screen selector
        const screenSelect = document.createElement('select')
        screenSelect.style.cssText = `
            padding: 5px;
            margin-bottom: 10px;
            width: 100%;
        `
        screenSelect.innerHTML = `
            <option value="">Select a screen</option>
            <option value="Screen_About">About Screen</option>
            <option value="Screen_Projects">Projects Screen</option>
            <option value="Screen_Credits">Credits Screen</option>
            <option value="Screen_Video">Video Screen</option>
        `
        this.debugPanel.appendChild(screenSelect)
        
        // Create adjustment controls
        const controls = document.createElement('div')
        controls.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
        `
        
        // UV transform values with additional properties
        this.uvTransform = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            rotation: 0,
            invertX: false,
            invertY: false,
            fullscreen: false
        }
        
        // Create controls
        const createButton = (text, action) => {
            const btn = document.createElement('button')
            btn.textContent = text
            btn.style.cssText = `
                padding: 8px;
                cursor: pointer;
                border: 1px solid #444;
                background: #222;
                color: white;
                border-radius: 4px;
            `
            btn.addEventListener('click', action)
            return btn
        }
        
        const createToggleButton = (text, property) => {
            const btn = createButton(text, () => {
                this.uvTransform[property] = !this.uvTransform[property]
                btn.style.backgroundColor = this.uvTransform[property] ? '#066' : '#222'
                this.applyUVTransform()
            })
            return btn
        }
        
        // Fullscreen mode toggle (now with better aspect ratio handling)
        const fullscreenButton = createToggleButton('Fix Aspect Ratio (16:9)', 'fullscreen')
        fullscreenButton.style.marginBottom = '10px'
        controls.appendChild(fullscreenButton)
        
        // Position controls
        const positionLabel = document.createElement('div')
        positionLabel.textContent = 'Position Controls:'
        positionLabel.style.marginTop = '10px'
        controls.appendChild(positionLabel)
        
        const uvControls = document.createElement('div')
        uvControls.style.cssText = `
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
        `
        
        uvControls.appendChild(createButton('← Left', () => this.adjustUV('offsetX', -0.1)))
        uvControls.appendChild(createButton('↑ Up', () => this.adjustUV('offsetY', 0.1)))
        uvControls.appendChild(createButton('→ Right', () => this.adjustUV('offsetX', 0.1)))
        uvControls.appendChild(createButton('← Left (S)', () => this.adjustUV('offsetX', -0.01)))
        uvControls.appendChild(createButton('↓ Down', () => this.adjustUV('offsetY', -0.1)))
        uvControls.appendChild(createButton('→ Right (S)', () => this.adjustUV('offsetX', 0.01)))
        controls.appendChild(uvControls)
        
        // Scale controls
        const scaleLabel = document.createElement('div')
        scaleLabel.textContent = 'Scale Controls:'
        scaleLabel.style.marginTop = '10px'
        controls.appendChild(scaleLabel)
        
        const scaleControls = document.createElement('div')
        scaleControls.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        `
        scaleControls.appendChild(createButton('Zoom In', () => this.adjustUV('scale', -0.1)))
        scaleControls.appendChild(createButton('Zoom Out', () => this.adjustUV('scale', 0.1)))
        scaleControls.appendChild(createButton('Zoom In (S)', () => this.adjustUV('scale', -0.01)))
        scaleControls.appendChild(createButton('Zoom Out (S)', () => this.adjustUV('scale', 0.01)))
        controls.appendChild(scaleControls)
        
        // Rotation controls
        const rotationLabel = document.createElement('div')
        rotationLabel.textContent = 'Rotation Controls:'
        rotationLabel.style.marginTop = '10px'
        controls.appendChild(rotationLabel)
        
        const rotationControls = document.createElement('div')
        rotationControls.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        `
        rotationControls.appendChild(createButton('↻ 90°', () => this.adjustUV('rotation', 90)))
        rotationControls.appendChild(createButton('↺ -90°', () => this.adjustUV('rotation', -90)))
        controls.appendChild(rotationControls)
        
        // Flip controls
        const flipLabel = document.createElement('div')
        flipLabel.textContent = 'Flip Controls:'
        flipLabel.style.marginTop = '10px'
        controls.appendChild(flipLabel)
        
        const flipControls = document.createElement('div')
        flipControls.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 5px;
        `
        
        const invertXButton = createToggleButton('Flip Horizontal', 'invertX')
        const invertYButton = createToggleButton('Flip Vertical', 'invertY')
        flipControls.appendChild(invertXButton)
        flipControls.appendChild(invertYButton)
        controls.appendChild(flipControls)
        
        // Reset button
        const resetButton = createButton('Reset All', () => {
            this.uvTransform = { 
                offsetX: 0, 
                offsetY: 0, 
                scale: 1, 
                rotation: 0,
                invertX: false,
                invertY: false,
                fullscreen: false 
            }
            fullscreenButton.style.backgroundColor = '#222'
            invertXButton.style.backgroundColor = '#222'
            invertYButton.style.backgroundColor = '#222'
            this.applyUVTransform()
        })
        resetButton.style.marginTop = '10px'
        resetButton.style.backgroundColor = '#444'
        controls.appendChild(resetButton)
        
        // Export values button
        const exportButton = createButton('Export Values', () => this.exportUVValues())
        exportButton.style.marginTop = '10px'
        exportButton.style.backgroundColor = '#066'
        controls.appendChild(exportButton)
        
        this.debugPanel.appendChild(controls)
        
        // Toggle panel with keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && e.ctrlKey) {
                this.debugPanel.style.display = 
                    this.debugPanel.style.display === 'none' ? 'flex' : 'none'
            }
        })
        
        // Store screen selector reference
        this.screenSelect = screenSelect
        
        document.body.appendChild(this.debugPanel)
        
        console.log('Debug UI: Press Ctrl+P to toggle the panel')
    }

    // Method to adjust UV transform
    adjustUV(property, delta) {
        const selectedScreen = this.screenSelect.value
        if (!selectedScreen) {
            alert('Please select a screen first')
            return
        }
        
        this.uvTransform[property] += delta
        this.applyUVTransform(selectedScreen)
    }

    // Method to apply UV transform to selected screen
    applyUVTransform(screenName = this.screenSelect.value) {
        if (!screenName) return
        
        const screen = this.screenMeshes[screenName]
        if (!screen || !screen.geometry) return
        
        const uvAttribute = screen.geometry.attributes.uv
        if (!uvAttribute) return
        
        const uv = uvAttribute.array
        
        // Store the original UV if not already stored
        if (!screen.userData.originalUV) {
            screen.userData.originalUV = new Float32Array(uv)
        }
        
        const originalUV = screen.userData.originalUV
        
        for (let i = 0; i < uv.length; i += 2) {
            let u = originalUV[i]
            let v = originalUV[i + 1]
            
            // Apply rotation
            if (this.uvTransform.rotation !== 0) {
                const angle = this.uvTransform.rotation * Math.PI / 180
                const centerU = u - 0.5
                const centerV = v - 0.5
                
                const rotatedU = centerU * Math.cos(angle) - centerV * Math.sin(angle)
                const rotatedV = centerU * Math.sin(angle) + centerV * Math.cos(angle)
                
                u = rotatedU + 0.5
                v = rotatedV + 0.5
            }
            
            // Apply aspect ratio correction for 1920x1080 content
            if (this.uvTransform.fullscreen) {
                // Aspect ratio of 1920x1080 is 16:9
                const imageAspectRatio = 16 / 9
                
                // Scale to maintain aspect ratio
                const scaleU = imageAspectRatio / 1.0 // Adjust horizontal
                u = (u - 0.5) / scaleU + 0.5
            }
            
            // Apply scale (zoom)
            u = (u - 0.5) * this.uvTransform.scale + 0.5
            v = (v - 0.5) * this.uvTransform.scale + 0.5
            
            // Apply offset
            u += this.uvTransform.offsetX
            v += this.uvTransform.offsetY
            
            // Apply inversion
            if (this.uvTransform.invertX) {
                u = 1 - u
            }
            if (this.uvTransform.invertY) {
                v = 1 - v
            }
            
            uv[i] = u
            uv[i + 1] = v
        }
        
        uvAttribute.needsUpdate = true
        screen.geometry.computeBoundingSphere()
    }

    // Method to export current UV values
    exportUVValues() {
        const selectedScreen = this.screenSelect.value
        if (!selectedScreen) {
            alert('Please select a screen first')
            return
        }
        
        const output = {
            screen: selectedScreen,
            transform: { ...this.uvTransform }
        }
        
        console.log('UV Transform Values:', JSON.stringify(output, null, 2))
        
        // Copy to clipboard
        navigator.clipboard.writeText(JSON.stringify(output, null, 2))
            .then(() => alert('UV values copied to clipboard!'))
            .catch(() => alert('Failed to copy to clipboard'))
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
        this.states['Screen_Video'].textures.main = this.videoTexture
        this.states['Screen_Video'].textures.video = this.videoTexture
        
        // Update the screen material if it already exists
        if (this.screenMeshes['Screen_Video']) {
            this.screenMeshes['Screen_Video'].material.map = this.videoTexture
            this.screenMeshes['Screen_Video'].material.needsUpdate = true
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

    createExitButton() {
        // Create a button element
        this.exitButton = document.createElement('button')
        this.exitButton.id = 'exit-screen-button'
        this.exitButton.textContent = 'Back to Island'
        
        // Style the button
        this.exitButton.style.position = 'fixed'
        this.exitButton.style.left = '20px'
        this.exitButton.style.bottom = '20px'
        this.exitButton.style.padding = '10px 20px'
        this.exitButton.style.background = '#2a2a2a'
        this.exitButton.style.color = 'white'
        this.exitButton.style.border = 'none'
        this.exitButton.style.borderRadius = '5px'
        this.exitButton.style.fontSize = '16px'
        this.exitButton.style.fontWeight = 'bold'
        this.exitButton.style.cursor = 'pointer'
        this.exitButton.style.zIndex = '1000'
        this.exitButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
        this.exitButton.style.transition = 'all 0.3s ease'
        this.exitButton.style.opacity = '0'  // Start hidden
        this.exitButton.style.pointerEvents = 'none'  // Start disabled
        
        // Add hover effects
        this.exitButton.addEventListener('mouseover', () => {
            this.exitButton.style.background = '#3a3a3a'
        })
        
        this.exitButton.addEventListener('mouseout', () => {
            this.exitButton.style.background = '#2a2a2a'
        })
        
        // Add click event
        this.exitButton.addEventListener('click', () => {
            this.exitScreenView()
        })
        
        // Append to body
        document.body.appendChild(this.exitButton)
    }
    
    showExitButton() {
        this.exitButton.style.opacity = '1'
        this.exitButton.style.pointerEvents = 'auto'
    }
    
    hideExitButton() {
        this.exitButton.style.opacity = '0'
        this.exitButton.style.pointerEvents = 'none'
    }

  setScreens() {
        // Find screens in the model
        this.resources.items.alxislandModel.scene.traverse((child) => {
            if(child.name.startsWith('Screen_')) {
                console.log('Found screen:', child.name)
                
                // Create material for screen
                const material = new THREE.MeshBasicMaterial({
                    map: this.states[child.name]?.textures.main,
                    transparent: true
                })
                
                // Store original material for later
                child.userData.originalMaterial = child.material
                
                // Apply new material
                child.material = material
                
                // Store reference to screen
                this.screenMeshes[child.name] = child
                
                // Apply custom UV transforms for each screen
                if (child.geometry) {
                    const uvAttribute = child.geometry.attributes.uv
                    if (uvAttribute) {
                        const uv = uvAttribute.array
                        
                        // Store original UV coordinates
                        child.userData.originalUV = new Float32Array(uv)
                        
                        // Apply screen-specific transforms
                        if (child.name === 'Screen_Credits') {
                            // Apply saved transform values for Credits screen
                            const transform = {
                                offsetX: 0.13,
                                offsetY: 0.6,
                                scale: 2.100000000000001,
                                rotation: -270,
                                invertX: false,
                                invertY: true,
                                fullscreen: true
                            }
                            
                            for (let i = 0; i < uv.length; i += 2) {
                                let u = uv[i]
                                let v = uv[i + 1]
                                
                                // Apply rotation
                                if (transform.rotation !== 0) {
                                    const angle = transform.rotation * Math.PI / 180
                                    const centerU = u - 0.5
                                    const centerV = v - 0.5
                                    
                                    const rotatedU = centerU * Math.cos(angle) - centerV * Math.sin(angle)
                                    const rotatedV = centerU * Math.sin(angle) + centerV * Math.cos(angle)
                                    
                                    u = rotatedU + 0.5
                                    v = rotatedV + 0.5
                                }
                                
                                // Apply aspect ratio correction
                                if (transform.fullscreen) {
                                    const imageAspectRatio = 16 / 9
                                    const scaleU = imageAspectRatio / 1.0
                                    u = (u - 0.5) / scaleU + 0.5
                                }
                                
                                // Apply scale
                                u = (u - 0.5) * transform.scale + 0.5
                                v = (v - 0.5) * transform.scale + 0.5
                                
                                // Apply offset
                                u += transform.offsetX
                                v += transform.offsetY
                                
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
                        } else {
                            // For other screens, just apply basic rotation
                            for (let i = 0; i < uv.length; i += 2) {
                                // Get current UV coordinates
                                const oldU = uv[i]
                                const oldV = uv[i + 1]
                                
                                // First, rotate 90 degrees clockwise to fix orientation
                                uv[i] = 1 - oldV
                                uv[i + 1] = oldU
                            }
                            
                            // Apply aspect ratio correction for video screen
                            if (child.name === 'Screen_Video') {
                                for (let i = 0; i < uv.length; i += 2) {
                                    let u = uv[i]
                                    const imageAspectRatio = 16 / 9
                                    const scaleU = imageAspectRatio / 1.0
                                    u = (u - 0.5) / scaleU + 0.5
                                    uv[i] = u
                                }
                            }
                        }
                        
                        uvAttribute.needsUpdate = true
                        child.geometry.computeBoundingSphere()
                    }
                }
            }
        })
    }

    setupInteraction() {
        // Raycaster setup
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()

        // Click event listener
        window.addEventListener('click', (event) => {
            // Skip if we're in testing mode and clicked on UI
            if (this.testingMode && event.target.closest('#screen-testing-panel')) {
                return
            }
            
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

        // If clicking on the video screen, open YouTube
        if (screenMesh.name === 'Screen_Video') {
            window.open('https://www.youtube.com/watch?v=hO2FvV09F-A', '_blank')
            return
        }

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
    
        // Show the exit button
        this.showExitButton()
        
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
        // Get screen's world position
        const targetPosition = new THREE.Vector3()
        screenMesh.getWorldPosition(targetPosition)
        
        console.log(`Screen ${screenMesh.name} information:`)
        console.log(`- Position:`, targetPosition)
    
        // Get screen's rotation/orientation
        const screenQuaternion = screenMesh.getWorldQuaternion(new THREE.Quaternion())
        
        // Calculate the forward direction of the screen
        const normal = new THREE.Vector3(0, 0, 1)
        normal.applyQuaternion(screenQuaternion)
        normal.normalize()
        
        // Position camera directly in front of screen
        const cameraPosition = targetPosition.clone()
        
        // Move camera in the opposite direction of the normal
        cameraPosition.sub(normal.multiplyScalar(2.0))
        
        // Animate camera movement
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: cameraPosition.x,
            y: cameraPosition.y,
            z: cameraPosition.z,
            ease: "power2.inOut",
            onComplete: () => {
                this.isTransitioning = false
                this.activeScreen = screenMesh
            }
        })
    
        // Look directly at the center of the screen
        gsap.to(this.camera.controls.target, {
            duration: 1,
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            ease: "power2.inOut"
        })
        
        // Add event listener for escape key to exit screen view
        const escapeListener = (event) => {
            if (event.key === 'Escape') {
                this.exitScreenView()
                window.removeEventListener('keydown', escapeListener)
            }
        }
        window.addEventListener('keydown', escapeListener)
    }
    
    exitScreenView() {
        if (this.isTransitioning) return
        
        this.isTransitioning = true
        
        // Hide the exit button
        this.hideExitButton()
        
        // Reset camera to original position
        gsap.to(this.camera.instance.position, {
            duration: 1,
            x: -3.60, // Using values from your screenshot
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
            x: -3.23, // Using values from your screenshot
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
        // Testing mode doesn't need hover effects
        if (this.testingMode) return
        
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

        // Update video texture
        if (this.videoTexture) {
            this.videoTexture.needsUpdate = true
        }
    }
}