
const Fs = require("fs");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ChunkRenamePlugin = require("chunk-rename-webpack-plugin");
const Path = require("path");
const px2rem = require('postcss-plugin-px2rem');
const server = require("./vbuild/server");

var pages = {};
// var entryPath = "./src/entry";
function ergPages(entryPath, opts) {
	opts = opts || {};
	Fs.readdirSync(entryPath).forEach((path) => {
		name = path.replace(/.[^.]*$/, "");

		var obj = {
			entry: `${entryPath}/${name}`,
			template: `./public/${name}.html`,
		};
		for (var key in opts) {
			// if (key in obj) {
			// 	continue;
			// }
			obj[key] = opts[key];
		}
		pages[name] = obj;
	});
}
ergPages("./src/entry");

module.exports = {
	outputDir: Path.resolve(__dirname, "./dist/web"),
	assetsDir: "./static/",
	publicPath: "./",
	lintOnSave: 'error',
	runtimeCompiler: false,

	productionSourceMap: false,
	pages: pages,
	css: {
		loaderOptions: {
			postcss: {
                plugins: [
                    px2rem({
						remUnit: 100,
					})
				]
			},
			css: {
				url: function (url, resourcePath) {
					var reg = /[.\\/]*static\/([^/]+)\//;
					if (!reg.test(url)) {
						return true;
						// return false;
					}

					if (process.env.NODE_ENV != "production") {
						return false;
					}
					
					var rst = url.replace(reg, "../$1/");
					return rst;
				}
			},
			less: {
                lessOptions: {
                    javascriptEnabled: true,
                }
			}
		}
	},

	configureWebpack: config => {
		// config.optimization.splitChunks.minSize = 1024 * 1024 * 1024;
		// config.optimization.splitChunks.maxSize = 1024 * 1024 * 1024;

		// config.output.libraryTarget = "commonjs";
		// config.output.library = "lib";
		// config.output.libraryExport = "default";
		config.resolve.alias["@img"] = Path.resolve(__dirname, "./src/assets/img");
		// config.resolve.alias["vue$"] = "vue/dist/vue.esm-bundler.js";

        config.plugins.forEach((val) => {
            if (val instanceof HtmlWebpackPlugin) {
				val.options.debug = process.env.NODE_ENV != "production";
            }
		});

		// chunk
		// var objChunk = {};
		// for (var key in extendsEntry) {
		// 	config.entry[key] = extendsEntry[key].src;
		// 	objChunk[key] = extendsEntry[key].dst;
		// }
		
		// config.plugins.push(
		// 	// new VueHookWebpackPlugin(),
		// 	// new VueBindToModelWebpackPlugin(),
		// 	new ChunkRenamePlugin(objChunk),
		// );
		// console.info(config);
	},

	devServer: {
		open: false,
		host: "0.0.0.0",
		port: process.env.PORT || 8082,
		historyApiFallback: false,
		disableHostCheck: true,
		setup: server,
	}
}
