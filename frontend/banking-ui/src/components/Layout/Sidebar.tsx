import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  UsersIcon,
  UserIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: CreditCardIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Payments', href: '/payments', icon: BanknotesIcon },
  { name: 'Beneficiaries', href: '/beneficiaries', icon: UsersIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <CreditCardIcon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">Banking</h1>
            <p className="text-sm text-gray-500">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                isActive
                  ? 'sidebar-nav-item-active'
                  : 'sidebar-nav-item-inactive',
                'sidebar-nav-item'
              )}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
            >
              <item.icon
                className={clsx(
                  isActive ? 'text-primary-500' : 'text-gray-400',
                  'mr-3 flex-shrink-0 h-6 w-6'
                )}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <div className="flex-shrink-0 h-2 w-2 bg-green-400 rounded-full mr-2"></div>
          All systems operational
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;