import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardContent } from './card';


describe('Card Components', () => {
  describe('Card', () => {
    it('renders card component', () => {
      render(<Card data-testid="card">Card Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });

    it('renders children', () => {
      render(
        <Card>
          <div>Child Content</div>
        </Card>
      );
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders card header', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<CardHeader className="custom-class" data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toHaveClass('custom-class');
    });
  });

  describe('CardTitle', () => {
    it('renders card title', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<CardTitle className="custom-class" data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId('title')).toHaveClass('custom-class');
    });
  });

  describe('CardContent', () => {
    it('renders card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(<CardContent className="custom-class" data-testid="content">Content</CardContent>);
      expect(screen.getByTestId('content')).toHaveClass('custom-class');
    });
  });

  describe('Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Card Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders card without optional components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content Only')).toBeInTheDocument();
    });
  });
});
