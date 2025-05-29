'use client'

import { useState } from 'react'

interface InputPhoneProps {
  name: string
}

export function InputPhone({ name }: InputPhoneProps) {
  const [phone, setPhone] = useState('')

  function formatPhone(value: string) {
    const cleaned = value.replace(/\D/g, '') // Remove tudo que não é número
    const match = cleaned.match(/^(\d{0,2})(\d{0,1})(\d{0,4})(\d{0,4})$/)

    if (!match) return value

    const [, ddd, first, middle, last] = match

    let formatted = ''
    if (ddd) formatted += `(${ddd}`
    if (ddd && ddd.length === 2) formatted += `)`
    if (first) formatted += ` ${first}`
    if (middle) formatted += ` ${middle}`
    if (last) formatted += `-${last}`

    return formatted.trim()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value
    setPhone(formatPhone(input))
  }

  return (
    <input
      type="tel"
      id="phone"
      name={name}
      value={phone}
      onChange={handleChange}
      className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
      placeholder="(79) 9 99843-1776"
      required
    />
  )
}
