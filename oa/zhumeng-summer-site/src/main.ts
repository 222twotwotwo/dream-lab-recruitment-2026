import { createApp } from 'vue';
import { Quasar } from 'quasar';
import langZhCn from 'quasar/lang/zh-CN';

// Quasar 样式需先于自定义样式加载，保证我们的暖调主题可覆盖
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './style.css';

import App from './App.vue';
import { initScene } from './three-scene';
import { reveal } from './directives/reveal';

/* ---------- 3D 背景 ---------- */
const bgContainer = document.getElementById('webgl-bg');
if (bgContainer) {
  initScene(bgContainer);
}

createApp(App)
  .use(Quasar, { plugins: {}, lang: langZhCn })
  .directive('reveal', reveal)
  .mount('#app');
