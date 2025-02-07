export default class EventEmitter {
    constructor() {
        this.callbacks = {}
        this.callbacks.base = {}
    }

    on(_names, callback) {
        const names = typeof _names === 'string' ? [_names] : _names
        
        for(const name of names) {
            if(typeof this.callbacks[name] === 'undefined') {
                this.callbacks[name] = []
            }

            this.callbacks[name].push(callback)
        }

        return this
    }

    off(_names) {
        const names = typeof _names === 'string' ? [_names] : _names
        
        for(const name of names) {
            if(typeof this.callbacks[name] === 'undefined') {
                continue
            }

            this.callbacks[name] = []
        }

        return this
    }

    emit(_name, _args) {
        if(typeof this.callbacks[_name] === 'undefined') {
            return false
        }

        for(const callback of this.callbacks[_name]) {
            callback.apply(this, _args || [])
        }

        return true
    }
}