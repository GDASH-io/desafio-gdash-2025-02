import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Input } from './input';

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders input element', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.tagName).toBe('INPUT');
  });


  it('renders with type email', () => {
    render(<Input type="email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders with type password', () => {
    render(<Input type="password" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with type number', () => {
    render(<Input type="number" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });


  it('accepts custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('can be required', () => {
    render(<Input required data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeRequired();
  });

  it('accepts default value', () => {
    render(<Input defaultValue="default text" data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('default text');
  });

  it('accepts controlled value', () => {
    render(<Input value="controlled value" onChange={() => {}} data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('controlled value');
  });

  it('accepts maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('accepts minLength attribute', () => {
    render(<Input minLength={5} data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('minLength', '5');
  });

  it('accepts pattern attribute', () => {
    render(<Input pattern="[0-9]*" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });

  it('accepts autoComplete attribute', () => {
    render(<Input autoComplete="email" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('accepts name attribute', () => {
    render(<Input name="username" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('name', 'username');
  });

  it('accepts id attribute', () => {
    render(<Input id="email-input" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'email-input');
  });
});
