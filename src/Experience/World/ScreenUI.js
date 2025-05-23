export default class ScreenUI {
    constructor(screensManager) {
        this.screens = screensManager
        
        // UI elements
        this.exitButton = null
        this.debugPanel = null
        this.screenSelect = null
        
        // UV transform for debugging
        this.uvTransform = {
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            rotation: 0,
            invertX: false,
            invertY: false,
            fullscreen: false
        }

        // Create project bounds debug UI
        this.createProjectBoundsDebugUI()
        
        // Create UI elements
        this.createExitButton()
        this.createDebugUI()
        
        // If in testing mode, create testing UI
        if (this.screens.testingMode) {
            this.createTestingUI()
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
            this.screens.exitScreenView()
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
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-height: 90vh;
            overflow-y: auto;
        `
        
        // Create title with close button
        const titleContainer = document.createElement('div')
        titleContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        `
        
        const title = document.createElement('h3')
        title.textContent = 'Screen Adjustment Panel'
        title.style.margin = '0'
        
        const closeButton = document.createElement('button')
        closeButton.textContent = '✕'
        closeButton.style.cssText = `
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 4px;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `
        closeButton.addEventListener('click', () => {
            this.debugPanel.style.display = 'none'
        })
        
        titleContainer.appendChild(title)
        titleContainer.appendChild(closeButton)
        this.debugPanel.appendChild(titleContainer)
        
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
        
        // Fullscreen mode toggle
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
        
        // Toggle cover mode button
        const toggleCoverButton = createButton('Toggle Cover Image', () => this.toggleCoverMode())
        toggleCoverButton.style.marginTop = '10px'
        toggleCoverButton.style.backgroundColor = '#066'
        controls.appendChild(toggleCoverButton)
        
        // Export values button
        const exportButton = createButton('Export Values', () => this.exportUVValues())
        exportButton.style.marginTop = '10px'
        exportButton.style.backgroundColor = '#066'
        controls.appendChild(exportButton)
        
        this.debugPanel.appendChild(controls)
        
        // Store screen selector reference
        this.screenSelect = screenSelect
        
        document.body.appendChild(this.debugPanel)
        
        console.log('Debug UI: Panel opened automatically. Use the X button to close.')
    }

    createTestingUI() {
        // Create testing panel for camera position testing
        const testingPanel = document.createElement('div')
        testingPanel.id = 'screen-testing-panel'
        testingPanel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            z-index: 1002;
        `
        
        const title = document.createElement('h3')
        title.textContent = 'Screen Testing Mode'
        title.style.margin = '0 0 15px 0'
        testingPanel.appendChild(title)
        
        // Add screen buttons
        Object.keys(this.screens.idealCameraPositions).forEach(screenName => {
            const button = document.createElement('button')
            button.textContent = screenName.replace('Screen_', '')
            button.style.cssText = `
                display: block;
                width: 100%;
                padding: 10px;
                margin-bottom: 10px;
                background: #333;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `
            button.addEventListener('click', () => {
                this.screens.focusScreen(this.screens.screenMeshes[screenName])
            })
            testingPanel.appendChild(button)
        })
        
        document.body.appendChild(testingPanel)
    }

    // Toggle between cover image and content
    toggleCoverMode() {
        const selectedScreen = this.screenSelect.value
        if (!selectedScreen) {
            alert('Please select a screen first')
            return
        }
        
        const screenState = this.screens.states[selectedScreen]
        if (!screenState || !screenState.hasOwnProperty('inCoverMode')) return
        
        screenState.inCoverMode = !screenState.inCoverMode
        
        const screenMesh = this.screens.screenMeshes[selectedScreen]
        if (!screenMesh) return
        
        // Apply the appropriate texture
        if (screenState.inCoverMode) {
            screenMesh.material.map = screenState.textures.cover
        } else {
            const currentView = screenState.currentView || screenState.currentTab || 'main'
            screenMesh.material.map = screenState.textures[currentView]
        }
        
        screenMesh.material.needsUpdate = true
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
        
        const screen = this.screens.screenMeshes[screenName]
        if (!screen || !screen.geometry) return
        
        this.screens.textureManager.applyUVTransform(screen, this.uvTransform)
    }

    createProjectBoundsDebugUI() {
        // Create overlay container
        this.boundsOverlay = document.createElement('div')
        this.boundsOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999;
            display: none;
        `
        
        // Create bounds control panel
        this.boundsPanel = document.createElement('div')
        this.boundsPanel.style.cssText = `
            position: fixed;
            top: 200px;
            left: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            z-index: 1003;
            display: none;
            flex-direction: column;
            gap: 10px;
        `
        
        // Title
        const title = document.createElement('h3')
        title.textContent = 'Project Bounds Editor'
        title.style.margin = '0 0 10px 0'
        this.boundsPanel.appendChild(title)
        
        // Toggle button
        const toggleButton = document.createElement('button')
        toggleButton.textContent = 'Toggle Bounds Overlay'
        toggleButton.style.cssText = `
            padding: 10px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 10px;
        `
        toggleButton.addEventListener('click', () => {
            const isVisible = this.boundsOverlay.style.display === 'block'
            this.boundsOverlay.style.display = isVisible ? 'none' : 'block'
            if (!isVisible) {
                this.updateBoundsOverlay()
            }
        })
        this.boundsPanel.appendChild(toggleButton)
        
        // Project selector
        this.projectSelect = document.createElement('select')
        this.projectSelect.style.cssText = `
            padding: 5px;
            margin-bottom: 10px;
            width: 100%;
        `
        this.projectSelect.innerHTML = `
            <option value="">Select Project</option>
            <option value="project1">Project 1 - Future Move</option>
            <option value="project2">Project 2 - Air Invest</option>
            <option value="project3">Project 3 - Sound Sketch</option>
            <option value="project4">Project 4 - My Portfolio</option>
            <option value="project5">Project 5 - Nexus</option>
            <option value="project6">Project 6 - V & V</option>
            <option value="project7">Project 7 - Nearby Nexus</option>
            <option value="project8">Project 8 - Elevate</option>
        `
        this.boundsPanel.appendChild(this.projectSelect)
        
        // Bounds inputs
        this.boundsInputs = {}
        const boundsLabels = ['x1', 'y1', 'x2', 'y2']
        boundsLabels.forEach(label => {
            const inputGroup = document.createElement('div')
            inputGroup.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 5px;'
            
            const labelEl = document.createElement('label')
            labelEl.textContent = label + ':'
            labelEl.style.width = '30px'
            
            const input = document.createElement('input')
            input.type = 'number'
            input.step = '0.01'
            input.style.cssText = 'flex: 1; padding: 5px;'
            input.addEventListener('input', () => {
                this.updateProjectBounds()
            })
            
            this.boundsInputs[label] = input
            inputGroup.appendChild(labelEl)
            inputGroup.appendChild(input)
            this.boundsPanel.appendChild(inputGroup)
        })
        
        // Update project bounds when selection changes
        this.projectSelect.addEventListener('change', () => {
            this.loadProjectBounds()
        })
        
        // Export button
        const exportButton = document.createElement('button')
        exportButton.textContent = 'Export All Bounds'
        exportButton.style.cssText = `
            padding: 10px;
            background: #008800;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        `
        exportButton.addEventListener('click', () => {
            this.exportProjectBounds()
        })
        this.boundsPanel.appendChild(exportButton)
        
        document.body.appendChild(this.boundsOverlay)
        document.body.appendChild(this.boundsPanel)
        
        // Show the panel
        this.boundsPanel.style.display = 'flex'
    }
    
    updateBoundsOverlay() {
        // Clear existing overlays
        this.boundsOverlay.innerHTML = ''
        
        // Get current project bounds from the screens manager
        const projectBounds = this.screens.clickableRegions['Screen_Projects']['main']
        
        projectBounds.forEach((project, index) => {
            const bounds = project.bounds
            const overlay = document.createElement('div')
            overlay.style.cssText = `
                position: absolute;
                left: ${bounds.x1 * 100}vw;
                top: ${bounds.y1 * 100}vh;
                width: ${(bounds.x2 - bounds.x1) * 100}vw;
                height: ${(bounds.y2 - bounds.y1) * 100}vh;
                border: 2px solid #ff0000;
                background: rgba(255, 0, 0, 0.2);
                pointer-events: auto;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
            `
            overlay.textContent = `P${index + 1}`
            overlay.addEventListener('click', () => {
                this.projectSelect.value = project.name
                this.loadProjectBounds()
            })
            this.boundsOverlay.appendChild(overlay)
        })
    }
    
    loadProjectBounds() {
        const selectedProject = this.projectSelect.value
        if (!selectedProject) return
        
        const projectBounds = this.screens.clickableRegions['Screen_Projects']['main']
        const project = projectBounds.find(p => p.name === selectedProject)
        
        if (project) {
            this.boundsInputs.x1.value = project.bounds.x1
            this.boundsInputs.y1.value = project.bounds.y1
            this.boundsInputs.x2.value = project.bounds.x2
            this.boundsInputs.y2.value = project.bounds.y2
        }
    }
    
    updateProjectBounds() {
        const selectedProject = this.projectSelect.value
        if (!selectedProject) return
        
        const projectBounds = this.screens.clickableRegions['Screen_Projects']['main']
        const project = projectBounds.find(p => p.name === selectedProject)
        
        if (project) {
            project.bounds.x1 = parseFloat(this.boundsInputs.x1.value) || 0
            project.bounds.y1 = parseFloat(this.boundsInputs.y1.value) || 0
            project.bounds.x2 = parseFloat(this.boundsInputs.x2.value) || 0
            project.bounds.y2 = parseFloat(this.boundsInputs.y2.value) || 0
            
            // Update visual overlay
            this.updateBoundsOverlay()
        }
    }
    
    exportProjectBounds() {
        const projectBounds = this.screens.clickableRegions['Screen_Projects']['main']
        const exportData = projectBounds.map(project => ({
            name: project.name,
            bounds: { ...project.bounds }
        }))
        
        console.log('Project Bounds:', JSON.stringify(exportData, null, 2))
        
        // Copy to clipboard
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
            .then(() => alert('Project bounds copied to clipboard!'))
            .catch(() => alert('Failed to copy to clipboard'))
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
}