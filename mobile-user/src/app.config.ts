export default defineAppConfig({
  pages: [
		'pages/auth/login/index',
		'pages/auth/register/index',
		'pages/index/index',
		'pages/list/index',
		'pages/detail/index',
		'pages/reservations/index',
		'pages/profile/index'
  ],
  permission: {
    'scope.userLocation': {
      desc: '用于获取您的位置以便提供附近酒店/城市定位服务'
    }
  },
  requiredPrivateInfos: ['getLocation'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '易宿酒店预订',
    navigationBarTextStyle: 'black'
  }
})

