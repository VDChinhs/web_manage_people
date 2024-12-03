"use client";
import { FaBars } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { SiNvidia } from "react-icons/si";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import PrivateRoute from "@/components/PrivateRoute";
import Image from 'next/image';

export default function Dashboard({ children, }: Readonly<{
  children: React.ReactNode;
}>) {
  const user = {
    name: 'admin',
    email: 'chinhvu@gmail.com',
  }
  const navigation = [
    { name: 'Manage People', href: '/dashboard/manage', current: true },
    { name: 'Tracking Time', href: '/dashboard/tracktime', current: false },
    { name: 'Check In', href: '/dashboard/checkin', current: false },
    { name: 'Working Time', href: '/dashboard/workingtime', current: false },
  ]
  const userNavigation = [
    { name: 'Sign out', href: '/' },
  ]

  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNavigation, setNavigation] = useState(navigation);

  const handleNavigation = (url: string) => {
    router.push(url);
    const updatedNavigation = isNavigation.map((item) => ({
      ...item,
      current: url === item.href,
    }));
    setNavigation(updatedNavigation);
  };
  return (
    <PrivateRoute>
      <html lang="en">
        <body>
          <nav className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <SiNvidia className="h-10 w-10" color="green" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {isNavigation.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          aria-current={item.current ? 'page' : undefined}
                          className={`${item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} rounded-md px-3 py-2 text-sm font-medium`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="ml-4 flex items-center sm:ml-6">
                    <div className="relative ml-3">
                      <button
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">Open user menu</span>
                        <Image
                          src="/avatar.jpg"
                          width={64}
                          height={64}
                          className="h-8 w-8 rounded-full"
                          alt="avatar">
                        </Image>
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                          {userNavigation.map((item) => (
                            <a
                              key={item.name}
                              onClick={() => {
                                document.cookie = "token=; path=/";
                                handleNavigation(item.href)
                              }}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="-mr-2 flex sm:hidden">
                  <button
                    onClick={() => setMenuOpen(!isMenuOpen)}
                    className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Open main menu</span>
                    {isMenuOpen ? <FaXmark className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>

            {isMenuOpen && (
              <div className="sm:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                  {isNavigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      aria-current={item.current ? 'page' : undefined}
                      className={`${item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} block rounded-md px-3 py-2 text-base font-medium`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <Image
                          src="/avatar.jpg"
                          width={64}
                          height={64}
                          className="h-10 w-10 rounded-full"
                          alt="avatar">
                        </Image>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{user.name}</div>
                      <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </nav>
          {children}
        </body>
      </html>
    </PrivateRoute>
  );
}
