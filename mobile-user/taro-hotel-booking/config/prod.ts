import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {},
  h5: {
    compile: {
      include: [
        // 确保产物为 es5
        filename => /node_modules\/(?!(@babel|core-js|style-loader|css-loader|react|react-dom))/.test(filename)
      ]
    },
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {
    webpackChain(chain) {
	  // eslint-disable-next-line @typescript-eslint/no-var-requires
	  const path = require('path')

      // Webpack 默认 performance budget(244KiB) 对 Taro+React 项目偏小，会导致大量告警；
      // 这里调高阈值，避免在 CI/构建输出里被 warning 淹没。
      // 注意：这类告警不影响产物可用性，但会让构建输出看起来像“报错”。
      // 默认关闭 hints；如需继续用 budget 约束体积，可改回 'warning' 并设置阈值。
      chain.performance.hints(false)

	  // 业务不使用视频时，可用 stub 替换 hls.js（大幅减小 vendors 包体）
    const hlsStub = path.resolve(__dirname, '../src/shims/hls-empty.ts')
    chain.resolve.alias.set('hls.js', hlsStub)
    chain.resolve.alias.set('hls.js/dist/hls.mjs', hlsStub)
    chain.resolve.alias.set('hls.js/dist/hls.js', hlsStub)

    // 生产环境通常不需要 sourcemap；关闭能减少产物体积与首屏下载量
    chain.devtool(false)

    // 拆分 runtime + vendor，提升首屏与后续页面缓存命中
    chain.optimization.runtimeChunk({ name: 'runtime' })
    chain.optimization.splitChunks({
    chunks: 'all',
    maxInitialRequests: 20,
    maxAsyncRequests: 20,
    cacheGroups: {
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 40,
        enforce: true
      },
      taro: {
        test: /[\\/]node_modules[\\/]@tarojs[\\/]/,
        name: 'taro',
        chunks: 'all',
        priority: 30,
        enforce: true
      },
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
        reuseExistingChunk: true
      }
    }
    })

    // 可选：生成体积报告（静态 HTML），用于定位真正的大头依赖
    const analyze = process.env.ANALYZE === '1' || String(process.env.ANALYZE).toLowerCase() === 'true'
    if (analyze) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    chain.plugin('bundle-analyzer').use(BundleAnalyzerPlugin, [
      {
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json'
      }
    ])
    }
    },
    // 若你想完全关闭此类告警，可改为：
    // webpackChain(chain) { chain.performance.hints(false) }

    // webpackChain (chain) {
    //   /**
    //    * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 插件对打包体积进行分析。
    //    * @docs https://github.com/webpack-contrib/webpack-bundle-analyzer
    //    */
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    //   /**
    //    * 如果 h5 端首屏加载时间过长，可以使用 prerender-spa-plugin 插件预加载首页。
    //    * @docs https://github.com/chrisvfritz/prerender-spa-plugin
    //    */
    //   const path = require('path')
    //   const Prerender = require('prerender-spa-plugin')
    //   const staticDir = path.join(__dirname, '..', 'dist')
    //   chain
    //     .plugin('prerender')
    //     .use(new Prerender({
    //       staticDir,
    //       routes: [ '/pages/index/index' ],
    //       postProcess: (context) => ({ ...context, outputPath: path.join(staticDir, 'index.html') })
    //     }))
    // }
  }
} satisfies UserConfigExport<'webpack5'>
