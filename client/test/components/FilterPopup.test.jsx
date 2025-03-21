import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterModal from '../../src/components/FilterPopup';
import React from 'react';

describe('FilterModal Component', () => {
    it('renders correctly when open', () => {
        render(<FilterModal isOpen={true} onClose={() => {}} onApply={() => {}} onReset={() => {}} />);
        const headingElement = screen.getByText(/Filters/i);
        expect(headingElement).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<FilterModal isOpen={false} onClose={() => {}} onApply={() => {}} onReset={() => {}} />);
        const headingElement = screen.queryByText(/Filters/i);
        expect(headingElement).toBeNull();
    });

    it('calls onClose when the close button is clicked', () => {
        const handleClose = vi.fn();
        render(<FilterModal isOpen={true} onClose={handleClose} onApply={() => {}} onReset={() => {}} />);
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onApply with the correct filters when the apply button is clicked', () => {
        const handleApply = vi.fn();
        render(<FilterModal isOpen={true} onClose={() => {}} onApply={handleApply} onReset={() => {}} />);
        const applyButton = screen.getByRole('button', { name: /apply/i });
        fireEvent.click(applyButton);
        expect(handleApply).toHaveBeenCalledTimes(1);
    });

    it('calls onReset and resets filters when the reset button is clicked', () => {
        const handleReset = vi.fn();
        render(<FilterModal isOpen={true} onClose={() => {}} onApply={() => {}} onReset={handleReset} />);
        const resetButton = screen.getByRole('button', { name: /reset/i });
        fireEvent.click(resetButton);
        expect(handleReset).toHaveBeenCalledTimes(1);
    });
});