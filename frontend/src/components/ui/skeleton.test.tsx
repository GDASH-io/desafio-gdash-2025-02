import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton Component', () => {
  it('renders skeleton element', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('applies rectangular variant by default', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('applies text variant', () => {
    const { container } = render(<Skeleton variant="text" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-full');
  });

  it('applies circular variant', () => {
    const { container } = render(<Skeleton variant="circular" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('applies rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('has animate-pulse class', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('has bg-muted class', () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('bg-muted');
  });

  it('accepts custom className', () => {
    const { container } = render(<Skeleton className="custom-class" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('applies custom width as number', () => {
    const { container } = render(<Skeleton width={200} data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
  });

  it('applies custom width as string', () => {
    const { container } = render(<Skeleton width="50%" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]') as HTMLElement;
    expect(skeleton.style.width).toBe('50%');
  });

  it('applies custom height as number', () => {
    const { container } = render(<Skeleton height={100} data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]') as HTMLElement;
    expect(skeleton.style.height).toBe('100px');
  });

  it('applies custom height as string', () => {
    const { container } = render(<Skeleton height="10rem" data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]') as HTMLElement;
    expect(skeleton.style.height).toBe('10rem');
  });

  it('applies both custom width and height', () => {
    const { container } = render(<Skeleton width={150} height={75} data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]') as HTMLElement;
    expect(skeleton.style.width).toBe('150px');
    expect(skeleton.style.height).toBe('75px');
  });

  it('combines variant classes with custom className', () => {
    const { container } = render(
      <Skeleton variant="circular" className="custom-class" data-testid="skeleton" />
    );
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass('rounded-full');
    expect(skeleton).toHaveClass('custom-class');
  });
});
