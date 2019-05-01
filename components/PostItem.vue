<template>
    <v-list-tile
    :id="post.id"
    :key="post.id"
    nuxt :to="route">
    <v-list-tile-avatar v-if="post.url || post.urls">
        <div style="border: 1px solid white; padding: 2px 4px">{{getExt(post.url || post.urls)}}</div>
    </v-list-tile-avatar>
    <v-list-tile-content>
        <v-list-tile-sub-title v-if="post.cat"><span class="font-weight-bold"
        :style="getColor(post.cat)">{{ post.cat.toUpperCase() }}
        </span>{{ ` ${post.gName}` }}</v-list-tile-sub-title>
        <v-list-tile-title>{{ post.name || post.text }}</v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-avatar v-if="followsCt">
        <div style="">{{ followsCt }}</div>
    </v-list-tile-avatar>
    </v-list-tile>
</template>
<script>
import util from '~/assets/js/util'

export default {
    props: ['post','route','followsCt'],
    methods: {
        getColor (cat) {
            return util.getColor(cat)
        },
        underscoreTitle (val){
            return util.underscoreTitle(val)
        },
        getExt (url){
            const splitArr = typeof url === 'string' ? url.split(this.post.id) : url[0].split(this.post.id)
            const newStr = splitArr[splitArr.length-1].split('.')
            const finalStr = newStr[newStr.length-1].split('?').shift()
            return finalStr.toUpperCase()
        }
    }
}
</script>
<style>
</style>