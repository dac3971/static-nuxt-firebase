<template>
    <v-btn depressed
    outline
    style="font-size:12px; margin:0"
    small
    >
        <v-progress-circular :width=1 v-if="spinner"
        size="10" indeterminate></v-progress-circular>
        <div v-else>
    {{ follow ? "UNFOLLOW" : "FOLLOW" }}</div>
    </v-btn>
</template>
<script>
export default {
    props: ['follow', 'spinner']
}
</script>