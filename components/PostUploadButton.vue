<template>
    <v-btn
    class="text-capitalize"
    nuxt
    :to="getRoute()"
    outline
    style="font-size:12px; margin:0"
    active-class
    flat
    small
    >{{ `${text == 'g' ? 'post here' : 'add group'} »` }}
    </v-btn>
</template>
<script>
export default {
    props: ['text','id'],
    methods: {
        getRoute (){
            if(this.$store.state.user){
                return `/${this.text == 'g' ? 'upload': 'add'}/${this.id}`
            }else
                return '/account/login'
        }
    }
}
</script>