import React from 'react'
import Toolbar from './Toolbar'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export const HomeLayout = () => {
    return (
        <div className='flex flex-col h-full p-6'>
            <Toolbar />
            <div className="flex bg-white border rounded-xl h-full">
                <Sidebar />
                <div className="flex-1 h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
