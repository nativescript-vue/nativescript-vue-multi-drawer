# NativeScript-Vue Multi Drawer

A plugin which provides a drawer component that supports multiple drawers.

<img src="https://raw.githubusercontent.com/nativescript-vue/nativescript-vue-multi-drawer/master/multi-drawer-demo.gif" width="350">

All drawers are optional, and can be configured individually.

Features:

- drawers on left, right, top and bottom
- swipe to open
- swipe to close
- tap outside to close
- progressively dim main content as the drawer is opened
- enable/disable drawers programmatically
- drawers can be fixed in the layout

## Quick Start

```bash
$ npm i --save nativescript-vue-multi-drawer
```

```diff
// main.js
import Vue from 'nativescript-vue'
...
+ import MultiDrawer from 'nativescript-vue-multi-drawer'
+ Vue.use(MultiDrawer)
```

Optionally set default options by passing `options` when installing the plugin:

```js
Vue.use(MultiDrawer, {
  // override any option here
  // for example enable debug mode
  debug: true,
})
```

For the available options check [the source of defaultOptions](https://github.com/tralves/nativescript-vue-multi-drawer/blob/f33f828400297cfa96d0fd9f0fd11a0b402bb721/index.js#L5-L84)

```xml
<MultiDrawer>
  <StackLayout slot="left">
    <Label text="Im in the left drawer" />
  </StackLayout>
  <StackLayout slot="right">
    <Label text="Im in the right drawer" />
  </StackLayout>
  <StackLayout slot="top">
    <Label text="Im in the top drawer" />
  </StackLayout>
  <StackLayout slot="bottom">
    <Label text="Im in the bottom drawer" />
  </StackLayout>

  <Frame /> <!-- main content goes into the default slot -->
</MultiDrawer>
```

The component will only enable drawers that have contents in them, so if you only need a left and a right side drawer, you can just remove the top and bottom slots and it will work as expected.

### Opening a drawer from code

Assign a ref to the Drawer component

```xml
<MultiDrawer ref="drawer" />
```

And use `this.$refs.drawer.open(side)` where `side` is a string: `left`, `right`, `top` or `bottom`.

### Using v-model to toggle the drawer

The drawer can be opened through v-model. This is useful as it allows controlling the drawer state with Vue's reactivity system. For example, the value of v-model could easily come from a vuex store.

```xml
<MultiDrawer v-model="drawerState" />
```

```js
export default {
  data() {
    return {
      drawerState: false, // closed
    }
  },

  methods: {
    doStuff() {
      // do stuff
      this.drawerState = 'left' // this will open the left drawer
    },
  },
}
```

### "Fixed" left/right sidebars

Suppose your app has a navigation left side bar. On a phone, the side bar is pulled from the left, but maybe on a tablet we have enough room to keep it visible all the time.

You can implement that by setting the variable `<side>.fixed` in `options`. E.g.:

```xml
<template>
  <Page>
    <MultiDrawer :options="drawerOptions">
      <StackLayout slot="left" backgroundColor="#c88">
        <Label text="Im in the left drawer"/>
      </StackLayout>
      <StackLayout slot="right">
        <Label text="Im in the right drawer"/>
      </StackLayout>
      <StackLayout>
        <Label text="Im in the main content"/>
        <Button text="Make left drawer fixed" @tap="toggleDrawer(true)"/>
        <Button text="Make left drawer hidden" @tap="toggleDrawer(false)"/>
      </StackLayout>
    </MultiDrawer>
  </Page>
</template>
<script>
export default {
  data() {
    return {
      drawerOptions: {
        left: { width: "250", fixed: false }
      }
    };
  },
  methods: {
    toggleDrawer(fixed) {
      this.drawerOptions.left.fixed = fixed;
    }
  }
};
</script>
```

#### Making the app "responsive"

With this feature, we can make our app "responsive" by adjusting the layout to the available screen real estate. Suppose our app has a left drawer for navigation and a right drawer for details. On a phone, both drawers are hidden. On a tablet in portrait mode, the left navigation drawer is fixed. On a tablet in landscape mode, the both left navigation and right detail drawers are fixed. We can implement these modes with the code:

```xml
<template>
  <Page ref="layout" @layoutChanged="updateLayout">
    <MultiDrawer :options="drawerOptions">
      <StackLayout slot="left" class="navigation-drawer">
        <Label text="Im in the navigation drawer"/>
      </StackLayout>
      <StackLayout slot="right" class="details-drawer">
        <Label text="Im in the details drawer"/>
      </StackLayout>
      <StackLayout>
        <Label text="Im in the main content"/>
      </StackLayout>
    </MultiDrawer>
  </Page>
</template>

<script >
import * as utils from "utils/utils";

export default {
  data() {
    return {
      navigationFixed: false,
      detailsFixed: false
    };
  },
  computed: {
    drawerOptions() {
      return {
        left: {
          width: "250",
          fixed: this.navigationFixed
        },
        right: {
          width: "250",
          fixed: this.detailsFixed
        }
      };
    }
  },
  methods: {
    updateLayout() {
      // get the screen width in DPIs.
      const screenWidth = utils.layout.toDeviceIndependentPixels(
        this.$refs.layout.nativeView.getMeasuredWidth()
      );

      this.navigationFixed = false;
      this.detailsFixed = false;
      // screen is wide enough for a fixed navigation bar
      if (screenWidth > 700) {
        this.navigationFixed = true;
      }
      // screen is wide enough for a fixed navigation bar and fixed details bar
      if (screenWidth > 1000) {
        this.detailsFixed = true;
      }
    }
  },
};
</script>
```

<img src="https://raw.githubusercontent.com/nativescript-vue/nativescript-vue-multi-drawer/master/responsive-phone-demo.gif" width="350">
<img src="https://raw.githubusercontent.com/nativescript-vue/nativescript-vue-multi-drawer/master/responsive-tablet-demo.gif" width="350">

### Enabling/disabling a drawer temporarily

You can temporarily enable/disable drawers programmatically by setting the variable `<side>.enabled` in `options`. E.g:

```xml
<template>
  <MultiDrawer :options="drawerOptions">
    <StackLayout slot="left">
      <Label text="Im in the left drawer" />
    </StackLayout>
    <StackLayout slot="right">
      <Label text="Im in the right drawer" />
    </StackLayout>
  </MultiDrawer>
</template>
<script>
export default {
  data: {
    return {
      drawerOptions: {
        left: { enabled: true },
        right: { enabled: true }
      }
    }
  },
  methods: {
    toggleDrawers(enabled) {
      this.drawerOptions.left.enabled = enabled;
      this.drawerOptions.right.enabled = enabled;
    }
  }
}
</script>
```

## Troubleshoot

If adding this plugin causes errors in Android builds like `java.io.FileNotFoundException: (...)platforms/android/build-tools/sbg-bindings.txt (No such file or directory)` and runtime exceptions `Caused by: java.lang.ClassNotFoundException: Didn't find class "com.tns.NativeScriptActivity"`, add `node: "6"` as a target in `babel.config.js`, like so:

```js
module.exports = function(api) {
  api.cache(true)

  return {
    presets: [['@babel/env', {targets: {node: '6', esmodules: true}}]],
    plugins: ['syntax-async-functions'],
  }
}
```
