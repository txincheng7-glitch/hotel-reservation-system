import { Suspense } from 'react';
import type { ReactNode } from 'react';
import {Navigate} from 'react-router-dom'

import Welcome from '../pages/Welcome/Welcome'
import Login from '../pages/Login/Login'

import Merchant from '../pages/Merchant/Merchant/Merchant'
import MerchantHome from '../pages/Merchant/MerchantHome/MerchantHome'
import HotelManage from '../pages/Merchant/HotelManage/HotelManage'
import Notice from '../pages/Merchant/Notice/Notice'
import HotelDetail from '../pages/Merchant/HotelDetail/HotelDetail'

import Admin from '../pages/Admin/adminpage/admin'
import ShowHotel from '../pages/Admin/ShowHotel/ShowHotel'
import PendHotel from '../pages/Admin/pendHotel/pendHotel'
import PublishHotel from '../pages/Admin/PublishHotel/PublishHotel'

export interface RouteConfig {
	path: string;
	element: ReactNode;
	children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
	{
        path: '/',
        element: <Navigate to="/welcome" replace />,
    },
    {
        path: '/welcome',
        element: <Welcome />,
    },
	{
		path: '/login',
		element: (
			<Suspense fallback={<div>加载中...</div>}>
				<Login />
			</Suspense>
		),
	},
	{
		path: '/merchant',
		element: (
			<Merchant />
		),
		children:[
			{
				path:'MerchantHome',
				element:<MerchantHome/>
			},
			{
				path:'HotelManage',
				element:<HotelManage/>
			},
			{
				path:'Notice',
				element:<Notice/>
			},
			{
				path:'HotelDetail/:id',
				element:<HotelDetail/>
			},
		]
	},
	{
		path: '/admin',
		element: (
			<Admin />
		),
		children:[
			{
				path:'showHotel',
				element:<ShowHotel/>
			},
			{
				path:'pendHotel',
				element:<PendHotel/>
			},
			{
				path:'publishHotel',
				element:<PublishHotel/>
			},
		]
	},
];