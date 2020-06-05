import mergeOptions from 'merge-options'

import MultiDrawer from './components/MultiDrawer'

export let defaultOptions = {
  debug: false,
  backdropColor: 'rgba(0, 0, 0, 0.7)',
  left: {
    width: '70%',
    height: null,
    backgroundColor: '#ffffff',
    canSwipeOpen: true,
    swipeOpenTriggerWidth: 30,
    swipeOpenTriggerHeight: null,
    swipeOpenTriggerMinDrag: 50,
    swipeCloseTriggerMinDrag: 50,
    swipeOpenTriggerProperties: {},
    animation: {
      openDuration: 300,
      closeDuration: 300,
    },
    translationOffsetMultiplier: -1,
    axis: 'X',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  right: {
    width: '70%',
    height: null,
    backgroundColor: '#ffffff',
    canSwipeOpen: true,
    swipeOpenTriggerWidth: 30,
    swipeOpenTriggerHeight: null,
    swipeOpenTriggerMinDrag: 50,
    swipeCloseTriggerMinDrag: 50,
    swipeOpenTriggerProperties: {},
    animation: {
      openDuration: 300,
      closeDuration: 300,
    },
    translationOffsetMultiplier: 1,
    axis: 'X',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  top: {
    width: null,
    height: '40%',
    backgroundColor: '#ffffff',
    canSwipeOpen: true,
    swipeOpenTriggerWidth: null,
    swipeOpenTriggerHeight: 50,
    swipeOpenTriggerMinDrag: 50,
    swipeCloseTriggerMinDrag: 50,
    swipeOpenTriggerProperties: {},
    animation: {
      openDuration: 300,
      closeDuration: 300,
    },
    translationOffsetMultiplier: -1,
    axis: 'Y',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  bottom: {
    width: null,
    height: '40%',
    backgroundColor: '#ffffff',
    canSwipeOpen: true,
    swipeOpenTriggerWidth: null,
    swipeOpenTriggerHeight: 30,
    swipeOpenTriggerMinDrag: 50,
    swipeCloseTriggerMinDrag: 50,
    swipeOpenTriggerProperties: {},
    animation: {
      openDuration: 300,
      closeDuration: 300,
    },
    translationOffsetMultiplier: 1,
    axis: 'Y',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
}

export default function install(Vue, options) {
  if(options) {
    defaultOptions = mergeOptions(defaultOptions, options)
  }

  Vue.component('MultiDrawer', MultiDrawer)
}
