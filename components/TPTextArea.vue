<template>
    <v-text-field style="border: 1px solid black"
    box
    hide-details
    v-model="text"
    v-bind:value="text"
    @change="$emit('input', $event.target.value)"
    @click="clickFunc"
    :placeholder="ph"
    ></v-text-field>
</template>
<script>
export default {
    props: ['value','ph','clickFunc',],
    data () {
        return {
            text: String
        }
    }
}
</script>
<style>
.b {
    color: black !important;
}
</style>