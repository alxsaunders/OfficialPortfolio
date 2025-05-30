export default class ScreenNavigation {
    constructor(screens) {
        this.screens = screens
        this.experience = screens.experience
        
        // Create navigation elements
        this.createNavigation()
        
        // Setup event listeners
        this.setupEventListeners()
    }
    
    createNavigation() {
        // Create nav container
        this.navElement = document.createElement('nav')
        this.navElement.className = 'nav-menu'
        
        // Create list
        const ul = document.createElement('ul')
        
        // Navigation items
        const navItems = [
            { text: 'Projects', screen: 'Screen_Projects' },
            { text: 'About', screen: 'Screen_About' },
            { text: 'Credits', screen: 'Screen_Credits' },
            { text: '2D Portfolio', screen: 'Screen_Video' }
        ]
        
        navItems.forEach(item => {
            const li = document.createElement('li')
            li.textContent = item.text
            li.setAttribute('data-screen', item.screen)
            ul.appendChild(li)
        })
        
        this.navElement.appendChild(ul)
        document.body.appendChild(this.navElement)
        
        // Store references
        this.navItems = this.navElement.querySelectorAll('li')
    }
    
    setupEventListeners() {
        // Click handlers for nav items
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleNavClick(item)
            })
        })
        
        // Listen for escape key to clear active state
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.clearActiveStates()
            }
        })
        
        // Override exitScreenView to clear active states
        const originalExitScreenView = this.screens.exitScreenView.bind(this.screens)
        this.screens.exitScreenView = () => {
            originalExitScreenView()
            this.clearActiveStates()
        }
    }
    
    handleNavClick(clickedItem) {
        // Remove active class from all items
        this.navItems.forEach(item => item.classList.remove('active'))
        
        // Add active class to clicked item
        clickedItem.classList.add('active')
        
        // Get screen name
        const screenName = clickedItem.getAttribute('data-screen')
        
        // Add loading state
        this.navElement.classList.add('loading')
        
        // Find and focus the screen
        const screenMesh = this.screens.screenMeshes[screenName]
        
        if (screenMesh) {
            // If screen is in cover mode, we need to handle that first
            const screenState = this.screens.states[screenName]
            
            if (screenState && screenState.hasOwnProperty('inCoverMode') && screenState.inCoverMode) {
                // Simulate the cover click behavior
                screenState.inCoverMode = false
                
                // Reset to starting state
                if (screenName === 'Screen_About') {
                    screenState.currentTab = 'main'
                } else if (screenName === 'Screen_Projects') {
                    screenState.currentView = 'main'
                } else if (screenName === 'Screen_Credits') {
                    screenState.currentView = 'main'
                }
                
                // Update texture
                screenMesh.material.map = screenState.textures.main
                screenMesh.material.needsUpdate = true
            }
            
            // Focus the screen
            this.screens.focusScreen(screenMesh)
            
            // Remove loading state after animation
            setTimeout(() => {
                this.navElement.classList.remove('loading')
            }, 1000)
        }
    }
    
    clearActiveStates() {
        this.navItems.forEach(item => item.classList.remove('active'))
    }
    
    // Update active state based on current screen
    updateActiveState(screenName) {
        this.navItems.forEach(item => {
            if (item.getAttribute('data-screen') === screenName) {
                item.classList.add('active')
            } else {
                item.classList.remove('active')
            }
        })
    }
    
    destroy() {
        // Clean up event listeners and DOM elements
        if (this.navElement) {
            this.navElement.remove()
        }
    }
}