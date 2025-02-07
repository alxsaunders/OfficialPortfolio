import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import EventEmitter from './EventEmitter'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        // Options
        this.sources = sources

        // Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {
            gltfLoader: new GLTFLoader(),
            textureLoader: new THREE.TextureLoader(),
            rgbeLoader: new RGBELoader()
        }
    }

    startLoading() {
        // Load each source
        for(const source of this.sources) {
            if(source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    (progress) => {
                        console.log(`Loading model: ${(progress.loaded / progress.total * 100)}%`)
                    },
                    (error) => {
                        console.error('Error loading model:', error)
                    }
                )
            }
            else if(source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading texture:', error)
                    }
                )
            }
            else if(source.type === 'hdrTexture') {
                this.loaders.rgbeLoader
                    .setDataType(THREE.FloatType)
                    .load(
                        source.path,
                        (file) => {
                            this.sourceLoaded(source, file)
                        },
                        (progress) => {
                            console.log(`Loading HDR: ${(progress.loaded / progress.total * 100)}%`)
                        },
                        (error) => {
                            console.error('Error loading HDR:', error)
                        }
                    )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file

        this.loaded++

        if(this.loaded === this.toLoad) {
            this.emit('ready')
        }
    }
}