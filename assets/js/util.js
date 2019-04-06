const util = {
    underscoreTitle (v) {
        return v.replace(/'/g,"").replace(/\s+|[\/]/g,"_").toLowerCase()
    },

    createSearchMap (v) {
        let searchMap = {}
        const cleanTerm = this.underscoreTitle(v)
        for (var i = 1; i<= cleanTerm.length; i++){
            searchMap[cleanTerm.substr(0,i)] = true
        }
        return searchMap
    },

    getColor (type) {
        let str = 'color: #'
        switch (type) {
            case 'for sale':
                str += '43A047'
                break
            case 'misc':
                str += '9C27B0'
                break
            case 'discussions':
                str += 'FF9800'
                break
            default:
                str += 'FF9800'
        }
        return str
    },

    groupDate(d){
        const one_sec = 1000, one_min = one_sec * 60, one_hour = one_min * 60, one_day = one_hour * 24,
        now = new Date(), thenDate = new Date(d), diff = now.getTime()-thenDate.getTime()
        // if(diff<one_sec*30) return `just now`
        // if(diff<one_min) return `${Math.round(diff/one_sec)}s`
        // if(diff<one_hour) return `${Math.round(diff/one_min)}m`
        // if(diff<one_day) return `${Math.round(diff/one_hour)}h`
        const partYear = thenDate.getFullYear()-2000,
        modifiedYear = partYear === now.getFullYear()-2000 ? '' : `/${partYear}`
        return `${thenDate.getMonth()+1}/${thenDate.getDate()}${modifiedYear}`
    },

    convertDate(d){
        const one_sec = 1000, one_min = one_sec * 60, one_hour = one_min * 60, one_day = one_hour * 24,
        now = new Date(), thenDate = new Date(d), diff = now.getTime()-thenDate.getTime()
        if(diff<one_sec*30) return `just now`
        if(diff<one_min) return `${Math.round(diff/one_sec)}s`
        if(diff<one_hour) return `${Math.round(diff/one_min)}m`
        if(diff<one_day) return `${Math.round(diff/one_hour)}h`
        const partYear = thenDate.getFullYear()-2000,
        modifiedYear = partYear === now.getFullYear()-2000 ? '' : `/${partYear}`
        return `${thenDate.getMonth()+1}/${thenDate.getDate()}${modifiedYear}`
    },
    
    duplicate(val, arr){
        for(var i = 0; i < arr.length; i++) {
            if(arr[i].id === val.id)
                return true
        }
        return false
    }

}

export default util