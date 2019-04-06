export const state = () => ({
    sInfo: null,
    subjectObj: {}
})


export const mutations = {
    setUnit (state,s) { state.sInfo = s},
    setSubjects (state,s) { state.subjectObj = s},
}