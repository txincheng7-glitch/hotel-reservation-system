// H5 端体积优化：如果业务不使用 <Video> 播放 HLS，可将 hls.js 替换为轻量 stub。
// 作用：显著减少 vendors 包体；代价：HLS 播放能力不可用。

export const Events = {}

export default class Hls {
  static isSupported() {
    return false
  }

  static get Events() {
    return Events
  }

  constructor(_config?: any) {}

  loadSource(_url: string) {}

  attachMedia(_media: any) {}

  on(_event: any, _fn: any) {}

  off(_event: any, _fn: any) {}

  destroy() {}
}
