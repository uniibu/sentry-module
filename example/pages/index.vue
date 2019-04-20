<template>
  <div>
    Works!
  </div>
</template>

<script>

export default {
  mounted(){
    this.$sentry.captureException(new Error('Test Error'))
  }
}
</script>
