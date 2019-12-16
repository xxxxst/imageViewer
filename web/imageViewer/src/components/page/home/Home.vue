<template>

<div class="home">
	<div class="hidden-box">
		<input type="text" ref="copyInput" v-noSpell>
		<div class="back"></div>
		<canvas ref="cvsImg" width="50px" height="50px"></canvas>
	</div>
	
	<div class="center-cont">
		<div class="top-box">
			<div class="row1">
				<div class="btn-left" @click="onClickBack()">
					<img src="static/image/arrowLeft.png" alt="">
				</div>
				<div class="input-box">
					<input type="text" v-model="path" v-noSpell placeholder="输入路径..." :style="{'color':showQuickBox?'#fff':'#000'}" @focus="showQuickBox=false" @blur="showQuickBox=true">
					<div class="quick-box" v-show="showQuickBox" ref="quickBox" @mousewheel="onQuickBoxMousewheel($event)">
						<div class="item" v-for="(it,idx) in lstPath" :key="idx" @click="onClickQuickItem(idx)">{{it}}</div>
					</div>
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
			<div class="row2">
				<div class="sort-box">
					<div class="lbl">排序方式: </div>
					<select v-model="sortType">
						<option v-for="(it,idx) in lstSortType" :key="idx" :value="it.key">{{it.desc}}</option>
					</select>
				</div>
				<div class="right-box">
					<label>
						<input type="checkbox" v-model="antiAliasing"/>
						<div class="lbl">抗锯齿</div>
					</label>
					<label>
						<input type="checkbox" v-model="isCopySuffix"/>
						<div class="lbl">复制后缀</div>
					</label>
				</div>
			</div>

		</div>

		<div class="content" ref="content" :style="{background:colorRgb}" :class="{'content-select': showPreviewBox}">
			<div class="item-box" v-for="(it,idx) in lstData" :key="idx" :style="getItemBoxStyle()" @mousedown="onDownImage(idx)" @mouseup="onUpImage($event, it, idx)">
				<div class="item" :class="{select:it===selectItem}">
					<div class="img-box" :style="getItemStyle()">
					<!-- <div class="img-box"> -->
						<img :class="{'anti-aliasing':!antiAliasing}" :id="'cont_img_'+idx" :src="getIcon(it)" alt="" @load="onImageLoad($event, it)" crossorigin="anonymous" v-noDrag>
					</div>
					<div class="lbl">{{it.name}}</div>
				</div>
			</div>
		</div>

		<div class="detail-box" v-show="showPreviewBox" :style="{background:colorRgb}">
			<div class="title-box" v-if="selectItem">
				<div class="row">
					<div class="lbl">尺寸:</div>
					<div class="size">{{selectOriginSize.w}} * {{selectOriginSize.h}}</div>
				</div>
				<div class="row">
					<div class="lbl">大小:</div>
					<div class="size">{{formatSize(selectItem.size)}}</div>
				</div>
				<div class="row">
					<div class="lbl">修改日期:</div>
					<div class="size">{{formatTime(selectItem.modifyTime)}}</div>
				</div>
			</div>
			<div class="img-box" ref="detailImgBox" @mousewheel="onDetailMousewheel($event)" @mousedown="onDownSelect($event)">
				<img :class="{'anti-aliasing':!antiAliasing}" v-if="selectItem" ref="detailImg" :src="getIcon(selectItem)" alt="" @load="onDetailImageLoad($event)">
			</div>
		</div>
	</div>
	<div class="bottom-box">
		<div class="right-box">
			<div class="lbl">右键点击图片复制文件名</div>
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
		position: absolute; top: 0; left: 10px; right: 10px; bottom: 25px;
		>.top-box {
			position: relative; width: 100%; height: 55px; margin-top: 10px; z-index: 10;
			>.row1 {
				position: relative; height: 25px;
				>.btn-left {
					cursor: pointer; display: inline-block; width: 25px; height: 25px; padding: 4px; border-radius: 8px;
					>img { width: 100%; height: 100% }
					&:hover { background: rgba(81, 140, 212, 0.2); border: 1px solid #7da2ce; }
				}
				>.input-box {
					position: absolute; display: inline-block; top: 0; left: 30px; right: 35px; height: 100%;
					>input { width: 100%; height: 100%; background: transparent; font-size: 12px; padding-left: 8px; border: 1px solid #000; border-radius: 4px; }
					>.quick-box {
						position: absolute; display: inline-block; max-width: 80%; left: 4px; top: 0; height: 25px; line-height: 25px; @extend %ex-one-line; overflow: hidden; overflow-x: auto; @include scrollbar(2px);
						>.item { 
							cursor: pointer; display: inline-block; height: 25px; line-height: 22px; padding: 0 4px; border: 1px solid transparent; border-top: 0; border-bottom: 0; font-size: 12px; vertical-align: top;
							&:hover { background: rgba(81, 140, 212, 0.2); border: 1px solid #7da2ce; border-top: 0; border-bottom: 0; }
						}
						.item+.item:before { content: ">" }
					}
				}
				>.right-box {
					position: absolute; display: inline-block; top: 0; right: 0; vertical-align: top;
					>.color-box {
						cursor: pointer; display: inline-block; width: 25px; height: 25px; border: 1px solid #c2c2c2; padding: 2px; border-radius: 3px;
						>.color-view { width: 100%; height: 100%; border-radius: 3px; }
						&:hover { border: 1px solid #858585; }
					}
					>.color-picker-box {
						position: absolute; display: inline-block; right: 0; top: 30px; padding: 8px; background: #fff; border: 1px solid #a5a5a5; border-radius: 4px;
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
			>.row2 {
				position: relative; height: 25px; margin-top: 5px;
				>.sort-box {
					display: inline-block; line-height: 25px;
					>.lbl { display: inline-block; font-size: 14px; }
					>select { width: 100px; height: 23px; padding-left: 8px; margin-left: 8px; border-radius: 3px; }
				}
				>.right-box {
					position: absolute; top: 0; right: 0; height: 25px; line-height: 25px; @extend %ex-one-line;
					>label {
						cursor: pointer; margin-left: 8px;
						>.lbl { display: inline-block; }
					}
				}
			}
		}
		.anti-aliasing { image-rendering: pixelated; }
		>.content {
			position: absolute; top: 70px; bottom: 0; left: 0; right: 0; border: 1px solid #000; border-radius: 8px; padding: 8px; overflow: hidden; overflow-y: auto; @include scrollbar(6px);
			>.item-box {
				// $w: 64px + 16px + 8px;
				cursor: pointer; display: inline-block; width: 76px; padding: 1px; vertical-align: top;
				>.item {
					// $w: 64px + 16px + 8px;
					position: relative; border-radius: 4px; overflow: hidden; border: 1px solid transparent; padding: 2px 8px; text-align: center;
					>.img-box {
						position: relative; width: 48px; height: 48px; margin-left: 4px; text-align: center;
						// >img { position: absolute; left: 0; bottom: 0; width: auto; height: auto; max-width: 100%; max-height: 100%; }
						>img { position: absolute; left: 0; bottom: 0; vertical-align: top; }
					}
					>.lbl { line-height: 14px; font-size: 12px; margin-top: 2px; padding: 2px 0; text-align: center; word-break: break-all; background: #fff; }
				}
				&:hover>.item,>.select  { background: rgba(81, 140, 212, 0.2); border: 1px solid #7da2ce; }
			}
		}
		>.content-select { right: 250px+5px; }
		>.detail-box {
			position: absolute; width: 250px; top: 70px; right: 0; bottom: 0; border: 1px solid #000; border-radius: 8px; overflow: hidden;
			>.title-box {
				background: #fff; width: 100%; padding: 4px 0; color: #000; font-size: 12px; text-align: center;
				>.row {
					display: table;
					>.lbl { display: table-cell; line-height: 16px; width: 80px; font-weight: bold; text-align: left; padding-left: 5px; @extend %ex-one-line; }
					>.size { display: table-cell; line-height: 16px; @extend %ex-one-line; }
				}
			}
			>.img-box {
				position: absolute; width: 100%; left: 0; top: 56px; bottom: 0; overflow: hidden; @extend %ex-no-select;
				>img { pointer-events: none; position: absolute; visibility: hidden; }
			}
		}
		>.bottom-box {
			position: absolute; bottom: 0; width: 90%; height: 20px; left: 5%;
		}
	}
	>.hidden-box {
		position: absolute;
		left: 99999px; top: 99999px; opacity: 0;
		>input { color: transparent; border: 0; background: transparent; }
		>.back { position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: #fff; }
	}
	>.bottom-box {
		position: absolute; bottom: 0; width: 100%; height: 25px;
		>.right-box {
			position: absolute; display: inline-block; right: 10px; top: 0; height: 100%;
			>.lbl { font-size: 12px; height: 25px; line-height: 25px; }
		}
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