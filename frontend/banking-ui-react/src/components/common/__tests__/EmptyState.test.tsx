import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmptyState } from '../EmptyState';

describe('EmptyState Component', () => {
    it('renders the title and description', () => {
        render(<EmptyState title="No Data" description="Please check back later." />);

        expect(screen.getByText('No Data')).toBeInTheDocument();
        expect(screen.getByText('Please check back later.')).toBeInTheDocument();
    });

    it('renders the action button when actionLabel and onAction are provided', () => {
        const onAction = vi.fn();
        render(<EmptyState title="No Data" actionLabel="Retry" onAction={onAction} />);

        const button = screen.getByRole('button', { name: /retry/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('does not render the action button when actionLabel or onAction are missing', () => {
        render(<EmptyState title="No Data" />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
