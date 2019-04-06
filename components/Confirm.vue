<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-card>
      <v-toolbar :color="options.color" dense flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" flat @click.stop="agree">Yes</v-btn>
        <v-btn color="primary" flat @click.stop="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
  export default {
    props: {
      value: Boolean
    },
    data: () => ({
      resolve: null,
      reject: null,
      message:  null,
      title: null,
      options: {
        color: 'white',
        width: 290
      }
    }),
    computed: {
      dialog: {
        get() {
          return this.value
        },
        set(value){
          this.$emit('input', value)
        }
      }
    },
    methods: {
      open(title, message, options) {
        this.title = title
        this.message = message
        this.options = Object.assign(this.options, options)
        return new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
        })
      },
      agree() {
        this.resolve(true)
        this.dialog = false
      },
      cancel() {
        this.resolve(false)
        this.dialog = false
      }
    }
  }
</script>