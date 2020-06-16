<template>
    <GridLayout>
        <!-- Main Content (default slot) -->
        <slot/>

        <Label v-show="backdropVisible"
               ref="backDrop"
               iosOverflowSafeArea="true"
               opacity="0"
               :backgroundColor="optionsInternal.backdropColor"
               @pan="onBackDropPan"
               @tap="close()"/>

        <template v-for="side in computedSidesEnabled">
            <!-- Drawer Content -->
            <GridLayout @layoutChanged="onDrawerLayoutChange(side)"
                        @tap="noop"
                        @pan="onDrawerPan(side, $event)"
                        :ref="`${side}Drawer`"
                        :style="computedDrawerStyle(side)">
                <slot :name="side"/>
            </GridLayout>
            <!-- Open Trigger -->
            <Label v-show="computedShowSwipeOpenTrigger(side)"
                   v-bind="computedSwipeOpenTriggerProperties(side)"
                   @pan="onOpenTriggerPan(side, $event)"/>
        </template>
    </GridLayout>
</template>

<script>
  import * as utils from 'tns-core-modules/utils/utils'
  import mergeOptions from 'merge-options'
  import {defaultOptions} from "../index";

  export default {
    model: {
      prop: 'state',
      event: 'stateChange',
    },
    props: {
      enabled: {
        type: Boolean,
        default: true,
      },
      options: {
        type: Object,
        required: false,
      },
      state: {
        type: [String, Boolean],
        default: false,
      },
    },
    watch: {
      async state(side) {
        if (this.computedOpenSide !== side) {
          await this.close()
        }
        if (side) {
          this.open(side)
        }
      },
      options: {
        handler(options) {
          this.optionsInternal = mergeOptions(defaultOptions, options)
        },
        immediate: true,
        deep: true,
      },
    },
    data() {
      return {
        // handled by the watcher
        optionsInternal: {},
        sides: {
          left: {
            open: false,
            translationOffset: 0,
          },
          right: {
            open: false,
            translationOffset: 0,
          },
          top: {
            open: false,
            translationOffset: 0,
          },
          bottom: {
            open: false,
            translationOffset: 0,
          },
        },
        backdropVisible: false,
        isAnimating: false,
        isPanning: false,
      }
    },
    computed: {
      computedSidesEnabled() {
        const validSides = Object.keys(this.sides)
        return Object.keys(this.$slots).filter(slotName =>
          validSides.includes(slotName)
        )
      },
      computedDrawerStyle() {
        return side => ({
          transform: `translate${this.optionsInternal[side].axis}(${
            this.sides[side].open ? 0 : this.sides[side].translationOffset
            })`,
          ...(this.optionsInternal[side].width
            ? {width: this.optionsInternal[side].width}
            : {}),
          ...(this.optionsInternal[side].height
            ? {height: this.optionsInternal[side].height}
            : {}),
          backgroundColor: this.optionsInternal[side].backgroundColor,
          [this.optionsInternal[side].axis === 'X'
            ? 'horizontalAlignment'
            : 'verticalAlignment']: side,
        })
      },
      computedSwipeOpenTriggerProperties() {
        return side => ({
          ...(this.optionsInternal[side].swipeOpenTriggerWidth
            ? {width: this.optionsInternal[side].swipeOpenTriggerWidth}
            : {}),
          ...(this.optionsInternal[side].swipeOpenTriggerHeight
            ? {height: this.optionsInternal[side].swipeOpenTriggerHeight}
            : {}),
          [this.optionsInternal[side].axis === 'X'
            ? 'horizontalAlignment'
            : 'verticalAlignment']: side,
          ...(this.optionsInternal.debug
            ? {backgroundColor: 'rgba(0, 255, 0, 0.3)'}
            : {}),
          ...this.optionsInternal[side].swipeOpenTriggerProperties,
        })
      },
      computedShowSwipeOpenTrigger() {
        return side => {
          if (!this.optionsInternal[side].canSwipeOpen) {
            return false
          }
          return !(this.computedOpenSide || this.isPanning || this.isAnimating)
        }
      },
      computedOpenSide() {
        return (
          this.computedSidesEnabled.find(side => this.sides[side].open) || false
        )
      },
    },
    methods: {
      noop() {
        // helper for catching events that we don't want to pass through.
      },
      async open(side = null) {
        if (!side) {
          if (!this.computedSidesEnabled.length) {
            throw new Error(
              'No sides are enabled, at least one side must be enabled to open the drawer'
            )
          }
          side = this.computedSidesEnabled[0]
        }

        if (!this.computedSidesEnabled.includes(side)) {
          return
        }

        if (this.isPanning || this.isAnimating) {
          return
        }

        this.isPanning = false
        this.isAnimating = true
        this.backdropVisible = true

        const duration = this.optionsInternal[side].animation.openDuration

        this.$refs.backDrop.nativeView.animate({
          opacity: 1,
          duration,
        })
        await this.$refs[`${side}Drawer`][0].nativeView.animate({
          translate: {
            x: 0,
            y: 0,
          },
          duration,
        })

        this.sides[side].open = true
        this.isAnimating = false
        this.$emit('stateChange', side)
      },
      async close(side = null) {
        if (this.isAnimating) {
          return
        }
        if (!side) {
          side = this.computedOpenSide
        }
        if (!side) {
          return
        }

        this.isPanning = false
        this.isAnimating = true

        const duration = this.optionsInternal[side].animation.closeDuration

        this.$refs[`${side}Drawer`][0].nativeView.animate({
          translate: {
            ...(this.optionsInternal[side].axis === 'X'
              ? {x: this.sides[side].translationOffset}
              : {x: 0}),
            ...(this.optionsInternal[side].axis === 'Y'
              ? {y: this.sides[side].translationOffset}
              : {y: 0}),
          },
          duration,
        })
        await this.$refs.backDrop.nativeView.animate({
          opacity: 0,
          duration,
        })

        this.sides[side].open = false
        this.backdropVisible = false
        this.isAnimating = false
        this.$emit('stateChange', false)
      },
      onDrawerLayoutChange(side) {
        const view = this.$refs[`${side}Drawer`][0].nativeView
        const safeAreaInsets = view.getSafeAreaInsets()
        this.sides[side].translationOffset =
          this.optionsInternal[side].translationOffsetMultiplier *
          utils.layout.toDeviceIndependentPixels(
            this.optionsInternal[side].axis === 'X'
              ? (view.getMeasuredWidth() + safeAreaInsets.left + safeAreaInsets.right)
              : (view.getMeasuredHeight() + safeAreaInsets.bottom + safeAreaInsets.top)
          )
      },
      onBackDropPan(args) {
        this.onDrawerPan(this.computedOpenSide, args)
      },
      onOpenTriggerPan(side, args) {
        this.onDrawerPan(side, args)
      },
      onDrawerPan(side, args) {
        if ((this.isPanning && this.isPanning !== side) || this.isAnimating) {
          return
        }
        if (!side) {
          return
        }
        const view = this.$refs[`${side}Drawer`][0].nativeView
        let panProgress = 0

        if (args.state === 1) {
          // down
          this.isPanning = side

          if (!this.sides[side].open) {
            this.$refs.backDrop.nativeView.opacity = 0
            this.backdropVisible = true
          }

          this.prevDeltaX = 0
          this.prevDeltaY = 0
        } else if (args.state === 2) {
          // panning

          if (this.optionsInternal[side].axis === 'X') {
            this.constrainX(
              view,
              side,
              view.translateX + (args.deltaX - this.prevDeltaX)
            )
            panProgress =
              Math.abs(view.translateX) /
              Math.abs(this.sides[side].translationOffset)
          } else {
            this.constrainY(
              view,
              side,
              view.translateY + (args.deltaY - this.prevDeltaY)
            )
            panProgress =
              Math.abs(view.translateY) /
              Math.abs(this.sides[side].translationOffset)
          }

          this.prevDeltaX = args.deltaX
          this.prevDeltaY = args.deltaY

          this.$refs.backDrop.nativeView.opacity = 1 - panProgress
        } else if (args.state === 3) {
          // up
          this.isPanning = false

          if (this.computedOpenSide === side) {
            // already open
            let distanceFromFullyOpen = 0
            if (this.optionsInternal[side].axis === 'X') {
              distanceFromFullyOpen = Math.abs(view.translateX)
            } else {
              distanceFromFullyOpen = Math.abs(view.translateY)
            }
            if (
              distanceFromFullyOpen >
              this.optionsInternal[side].swipeCloseTriggerMinDrag
            ) {
              this.close(side)
            } else {
              this.open(side)
            }
          } else {
            const offsetAbs = Math.abs(this.sides[side].translationOffset)
            const multiplier = this.optionsInternal[side]
              .translationOffsetMultiplier
            let distanceFromEdge = 0
            if (this.optionsInternal[side].axis === 'X') {
              distanceFromEdge = offsetAbs - multiplier * view.translateX
            } else {
              distanceFromEdge = offsetAbs - multiplier * view.translateY
            }

            if (
              distanceFromEdge <
              this.optionsInternal[side].swipeOpenTriggerMinDrag
            ) {
              this.close(side)
            } else {
              this.open(side)
            }
          }

          this.prevDeltaX = 0
          this.prevDeltaY = 0
        }
      },
      constrainX(view, side, x) {
        const offset = this.sides[side].translationOffset
        if (offset < 0) {
          if (x > 0) {
            view.translateX = 0
          } else if (this.sides[side].open && x < offset) {
            view.translateX = offset
          } else {
            view.translateX = x
          }
        } else {
          if (x < 0) {
            view.translateX = 0
          } else if (this.sides[side].open && x > offset) {
            view.translateX = offset
          } else {
            view.translateX = x
          }
        }
      },
      constrainY(view, side, y) {
        const offset = this.sides[side].translationOffset
        if (offset < 0) {
          if (y > 0) {
            view.translateY = 0
          } else if (this.sides[side].open && y < offset) {
            view.translateY = offset
          } else {
            view.translateY = y
          }
        } else {
          if (y < 0) {
            view.translateY = 0
          } else if (this.sides[side].open && y > offset) {
            view.translateY = offset
          } else {
            view.translateY = y
          }
        }
      },
    },
  }
</script>
