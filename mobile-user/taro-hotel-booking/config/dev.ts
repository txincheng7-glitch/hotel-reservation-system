import type { UserConfigExport } from "@tarojs/cli"

export default {
   logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
		hot: true,
		proxy: {
			'/api': {
				target: 'http://122.51.25.229:3000',
				changeOrigin: true
			}
		}
    }
  }
} satisfies UserConfigExport<'webpack5'>
