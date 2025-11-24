import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Label } from './label'

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Label className="custom-class">Test</Label>)
    expect(screen.getByText('Test')).toHaveClass('custom-class')
  })

  it('should associate with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>
    )
    expect(screen.getByText('Email')).toHaveAttribute('for', 'email')
  })
})
