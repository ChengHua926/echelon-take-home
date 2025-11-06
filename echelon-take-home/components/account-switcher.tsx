'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { User, ChevronDown, Shield } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { DEMO_USERS, getRoleInfo } from '@/lib/permissions'

export function AccountSwitcher() {
  const { currentUser, switchUser } = useRole()
  const roleInfo = getRoleInfo(currentUser.role)

  return (
    <div className="border-t border-slate-200 pt-6 mt-4">
      {/* Account Selector Card */}
      <div className="px-2">
        <Card className="p-4 bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Current User
              </span>
            </div>

            <Select value={currentUser.id} onValueChange={switchUser}>
              <SelectTrigger className="w-full bg-white hover:bg-slate-50 border-slate-300 transition-colors cursor-pointer h-auto py-3 px-3 shadow-sm hover:shadow-md hover:border-slate-400">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                    {currentUser.avatar}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {currentUser.title}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                </div>
              </SelectTrigger>
              <SelectContent className="w-[240px] bg-white border-2 border-slate-200 shadow-xl">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Switch Account
                  </span>
                </div>
                {DEMO_USERS.map((user) => {
                  const userRoleInfo = getRoleInfo(user.role)
                  return (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="cursor-pointer py-3 px-3 my-1 rounded-lg hover:bg-slate-50 focus:bg-slate-100 data-[state=checked]:bg-blue-50"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate mb-1">
                            {user.name}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-0.5 ${userRoleInfo.color} font-semibold`}
                          >
                            {userRoleInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Current Role Info */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Access Level
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Role:</span>
                <Badge variant="secondary" className={`${roleInfo.color} font-bold px-3 py-1`}>
                  {roleInfo.label}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                {roleInfo.description}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
