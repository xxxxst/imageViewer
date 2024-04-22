<template>
<div class="app">
	<router-view></router-view>
</div>
</template>

<script lang="ts">
import App from "./AppTs";
export default App;
</script>

<style lang="scss">
	html { height: 100%; font-size: 16px; -webkit-tap-highlight-color: rgba(255, 255, 255, 0); }
	body { height: 100%; overflow: hidden; margin: 0; padding: 0; font-size: 16px; background-color: #ffffff; }
	div,input,textarea,ul,li,label,a,table,tr,td { box-sizing: border-box; }
	div { line-height: 0; }
	input { outline: none; }
	table { border-collapse: collapse; table-layout:fixed; }
	tr,td { padding: 0px; }
	textarea { display: inline-block; resize:none; outline: none; }
	ul { list-style: none; margin: 0px; padding: 0px; vertical-align: top; }
	li { vertical-align: top; }
	a { text-decoration:none; outline:none; color: #000; }
</style>

<style lang="scss">
@import "assets/css/style.scss";

body { width: 100%; height: 100%; overflow: hidden; }
.app { position: absolute; width: 100%; height: 100%; top: 0; left: 0; overflow: hidden; }
</style>
