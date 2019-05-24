<template>
    <Page ref="layout"
          @layoutChanged="updateLayout">
        <MultiDrawer :options="drawerOptions">
            <StackLayout slot="left"
                         class="navigation-drawer">
                <Label text="Im in the navigation drawer" />
            </StackLayout>
            <StackLayout slot="right"
                         class="details-drawer">
                <Label text="Im in the details drawer" />
            </StackLayout>
            <StackLayout>
                <Label text="Im in the main content" />
            </StackLayout>
        </MultiDrawer>
    </Page>
</template>

<script >
import * as utils from 'utils/utils'

export default {
  data() {
    return {
      navigationFixed: false,
      detailsFixed: false,
    }
  },
  computed: {
    drawerOptions() {
      return {
        left: {
          width: '251',
          fixed: this.navigationFixed,
        },
        right: {
          width: '250',
          fixed: this.detailsFixed,
        },
      }
    },
  },
  methods: {
    updateLayout() {
      // get the screen width in DPIs.
      const screenWidth = utils.layout.toDeviceIndependentPixels(
        this.$refs.layout.nativeView.getMeasuredWidth()
      )

      this.navigationFixed = false
      this.detailsFixed = false
      // screen is wide enough for a fixed navigation bar
      if (screenWidth > 700) {
        this.navigationFixed = true
      }
      // screen is wide enough for a fixed navigation bar and fixed details bar
      if (screenWidth > 1000) {
        this.detailsFixed = true
      }
    },
  },
}
</script>

<style scoped>
ActionBar {
  background-color: #53ba82;
  color: #ffffff;
}

.navigation-drawer {
  background-color: #53ba82;
}

.details-drawer {
  background-color: #c9c9c9;
}
</style>
