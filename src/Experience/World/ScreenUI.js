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