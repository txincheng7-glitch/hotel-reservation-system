// 简单本地存储存根，用于演示页面骨架
export const getCurrentUserFromStorage = () => {
	try {
		const raw = localStorage.getItem('currentUser')
		return raw ? JSON.parse(raw) : null
	} catch (e) {
		return null
	}
}

export const saveCurrentUserToStorage = (user: any) => {
	try {
		localStorage.setItem('currentUser', JSON.stringify(user))
	} catch (e) {
		// ignore
	}
}

export const logout = () => {
	try {
		localStorage.removeItem('currentUser')
	} catch (e) {
		// ignore
	}
}

export const listSampleHotels = () => {
	// 返回一些示例数据，页面骨架可使用
	return []
}
