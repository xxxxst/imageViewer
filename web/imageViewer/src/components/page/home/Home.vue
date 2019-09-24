<template>

<div class="home">
	<div class="hidden-box">
		<input type="text" ref="copyInput" v-noSpell>
		<div class="back"></div>
	</div>
	
	<div class="center-cont">
		<div class="top-box">
			<div class="input-box">
				<input type="text" v-model="path" v-noSpell placeholder="输入路径...">
			</div>
			<div class="right-box">
				<div class="color-box" @click="onClickColorView()" @mousedown="isDownColorCont=true">
					<div class="color-view" :style="{background:colorRgb}"></div>
				</div>
				<div class="color-picker-box" v-show="isShowColorPicker" @mousedown="isDownColorCont=true">
					<div class="color-picker" ref="colorPicker"></div>
					<div class="bottom-box">
						<div class="com-color-box">
							<div class="item-box" v-for="(it,idx) in arrQuickColor" :key="idx" @click="onClickQuickColor(idx)"><div class="item" :style="{background:it}" /></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="content" ref="content" :style="{background:colorRgb}" :class="{'content-select': showPreviewBox}">
			<div class="item-box" v-for="(it,idx) in lstData" :key="idx" :style="getItemBoxStyle()" @mouseup="onClickImage($event, it)">
				<div class="item" :class="{select:it===selectItem}">
					<div class="img-box" :style="getItemStyle()">
					<!-- <div class="img-box"> -->
						<img :src="getIcon(it)" alt="" @load="onImageLoad($event, it)">
					</div>
					<div class="lbl">{{it.name}}</div>
				</div>
			</div>
		</div>

		<div class="detail-box" ref="detailBox" :style="{background:colorRgb}" @mousewheel="onDetailMousewheel($event)" @mousedown="onDownSelect($event)" v-show="showPreviewBox">
			<img v-if="selectItem" ref="detailImg" :src="getIcon(selectItem)" alt="" @load="onDetailImageLoad($event)">
		</div>
	</div>


</div>
</template>

<script lang="ts">
import Home from "./HomeTs";
export default Home;
</script>

<style lang="scss">
@import "/src/assets/css/style.scss";

.home {
	position: absolute; width: 100%; height: 100%; top: 0; left: 0;
	>.center-cont {
		position: absolute; top: 0; left: 20px; right: 20px; bottom: 20px;
		>.top-box {
			position: relative; width: 100%; height: 40px; margin-top: 20px; z-index: 10;
			>.input-box {
				position: absolute; display: inline-block; top: 0; left: 0; right: 50px; height: 100%;
				>input { width: 100%; height: 100%; background: transparent; padding-left: 8px; border: 1px solid #000; border-radius: 8px; }
			}
			>.right-box {
				position: absolute; display: inline-block; top: 0; right: 0; vertical-align: top;
				>.color-box {
					cursor: pointer; display: inline-block; width: 40px; height: 40px; border: 1px solid #c2c2c2; padding: 3px; border-radius: 5px;
					>.color-view { width: 100%; height: 100%; border-radius: 5px; }
					&:hover { border: 1px solid #858585; }
				}
				>.color-picker-box {
					position: absolute; display: inline-block; right: 0; top: 45px; padding: 8px; background: #fff; border: 1px solid #a5a5a5; border-radius: 4px;
					>.color-picker { width: 100%; height: 100%; }
					>.bottom-box {
						margin-top: 5px;
						>.com-color-box {
							height: 20px; @extend %ex-one-line;
							>.item-box {
								cursor: pointer; display: inline-block; width: 20px; height: 20px; padding: 2px; border: 1px solid #c2c2c2; border-radius: 2px; vertical-align: top;
								>.item { width: 100%; height: 100%; border-radius: 2px; }
								&:hover { border: 1px solid #858585; }
							}
							.item-box+.item-box { margin-left: 3.8px; }
						}
					}
				}
			}
		}
		>.content {
			position: absolute; top: 80px; bottom: 0; left: 0; right: 0; border: 1px solid #000; border-radius: 8px; padding: 8px; overflow: hidden; overflow-y: auto; @include scrollbar(6px);
			>.item-box {
				// $w: 64px + 16px + 8px;
				cursor: pointer; display: inline-block; width: 76px; padding: 1px; vertical-align: top;
				>.item {
					// $w: 64px + 16px + 8px;
					position: relative; border-radius: 4px; overflow: hidden; border: 1px solid transparent; padding: 2px 8px; text-align: center;
					>.img-box {
						position: relative; width: 48px; height: 48px; margin-left: 4px; text-align: center;
						// >img { position: absolute; left: 0; bottom: 0; width: auto; height: auto; max-width: 100%; max-height: 100%; }
						>img { position: absolute; left: 0; bottom: 0; }
					}
					>.lbl { line-height: 14px; font-size: 12px; margin-top: 2px; padding: 2px 0; text-align: center; word-break: break-all; background: #fff; }
				}
				&:hover>.item,>.select  { background: rgba(81, 140, 212, 0.2); border: 1px solid #7da2ce; }
			}
		}
		>.content-select { right: 250px+5px; }
		>.detail-box {
			position: absolute; width: 250px; top: 80px; right: 0; bottom: 0; border: 1px solid #000; border-radius: 8px; overflow: hidden; @extend %ex-no-select;
			>img { pointer-events: none; position: absolute; visibility: hidden; }
		}
		>.bottom-box {
			position: absolute; bottom: 0; width: 90%; height: 20px; left: 5%;
		}
	}
	>.hidden-box {
		position: absolute;
		left: -999px; top: -999px;
		>input { color: transparent; border: 0; background: transparent; }
		>.back { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff; }
	}
}
</style>


<style lang="scss">
.color-picker {
	position: relative; left: initial; top: initial;
}
.color-picker.static {
	display: inline-block;
	position: static;
}

.color-picker.static .color-picker-container {
	-webkit-box-shadow: none;
	-moz-box-shadow: none;
	box-shadow: none;
}
</style>