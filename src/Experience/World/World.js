import Experience from '../Experience.js'
import Environment from './Environment.js'
import House from './House.js'
import Screens from './Screens.js'

export default class World {
    constructor() {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.house = new House()
            this.screens = new Screens()
            this.environment = new Environment()
        })
    }

    update() {
        if(this.house)
            this.house.update()
        if(this.screens)
            this.screens.update()
    }
}