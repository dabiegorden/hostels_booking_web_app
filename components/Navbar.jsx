"use client"

import React, { useState } from 'react'
import { 
  ChevronDown, 
  Menu, 
  X, 
  PieChart, 
  MessageSquare, 
  Shield, 
  Puzzle, 
  RefreshCw, 
  Play, 
  Phone 
} from 'lucide-react'

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productMenuOpen, setProductMenuOpen] = useState(false)

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img className="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button 
            type="button" 
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <div className="relative">
            <button 
              type="button" 
              className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900" 
              aria-expanded={productMenuOpen}
              onClick={() => setProductMenuOpen(!productMenuOpen)}
            >
              Product
              <ChevronDown className="size-5 flex-none text-gray-400" />
            </button>

            {productMenuOpen && (
              <div className="absolute top-full -left-8 z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
                <div className="p-4">
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <PieChart className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href="#" className="block font-semibold text-gray-900">
                        Analytics
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-gray-600">Get a better understanding of your traffic</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <MessageSquare className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href="#" className="block font-semibold text-gray-900">
                        Engagement
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-gray-600">Speak directly to your customers</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Shield className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href="#" className="block font-semibold text-gray-900">
                        Security
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-gray-600">Your customers' data will be safe and secure</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Puzzle className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href="#" className="block font-semibold text-gray-900">
                        Integrations
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-gray-600">Connect with third-party tools</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <RefreshCw className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <a href="#" className="block font-semibold text-gray-900">
                        Automations
                        <span className="absolute inset-0"></span>
                      </a>
                      <p className="mt-1 text-gray-600">Build strategic funnels that will convert</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50">
                  <a href="#" className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100">
                    <Play className="size-5 flex-none text-gray-400" />
                    Watch demo
                  </a>
                  <a href="#" className="flex items-center justify-center gap-x-2.5 p-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-100">
                    <Phone className="size-5 flex-none text-gray-400" />
                    Contact sales
                  </a>
                </div>
              </div>
            )}
          </div>

          <a href="#" className="text-sm/6 font-semibold text-gray-900">Features</a>
          <a href="#" className="text-sm/6 font-semibold text-gray-900">Marketplace</a>
          <a href="#" className="text-sm/6 font-semibold text-gray-900">Company</a>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <a href="#" className="text-sm/6 font-semibold text-gray-900">Log in <span aria-hidden="true">&rarr;</span></a>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img className="h-8 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="" />
              </a>
              <button 
                type="button" 
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <div className="-mx-3">
                    <button 
                      type="button" 
                      className="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50" 
                      aria-controls="disclosure-1" 
                      aria-expanded={productMenuOpen}
                      onClick={() => setProductMenuOpen(!productMenuOpen)}
                    >
                      Product
                      <ChevronDown className="size-5 flex-none" />
                    </button>
                    {productMenuOpen && (
                      <div className="mt-2 space-y-2" id="disclosure-1">
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Analytics</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Engagement</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Security</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Integrations</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Automations</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Watch demo</a>
                        <a href="#" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Contact sales</a>
                      </div>
                    )}
                  </div>
                  <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Features</a>
                  <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Marketplace</a>
                  <a href="#" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Company</a>
                </div>
                <div className="py-6">
                  <a href="#" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Log in</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar