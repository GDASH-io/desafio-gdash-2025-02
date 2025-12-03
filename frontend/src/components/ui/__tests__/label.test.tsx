import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
  it('should render label with text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should render as label element', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label.tagName).toBe('LABEL');
  });

  it('should accept htmlFor prop', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('should accept custom className', () => {
    render(<Label className="custom-label">Custom</Label>);
    const label = screen.getByText('Custom');
    expect(label).toHaveClass('custom-label');
  });

  it('should be associated with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="test-input">Test</Label>
        <input id="test-input" />
      </>
    );
    const label = screen.getByText('Test');
    const input = screen.getByLabelText('Test');
    expect(label).toHaveAttribute('for', 'test-input');
    expect(input).toHaveAttribute('id', 'test-input');
  });
});

