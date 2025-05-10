import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../src/components/ConfirmPopup';
import React from 'react';

describe('ConfirmDialog Component', () => {
    it('renders correctly with the provided message', () => {
        render(<ConfirmDialog message="Are you sure?" onConfirm={() => {}} onCancel={() => {}} />);
        const messageElement = screen.getByText(/Are you sure?/i);
        expect(messageElement).toBeInTheDocument();
    });

    it('calls onConfirm when the Yes button is clicked', () => {
        const handleConfirm = vi.fn();
        render(<ConfirmDialog message="Are you sure?" onConfirm={handleConfirm} onCancel={() => {}} />);
        const confirmButton = screen.getByText(/Yes/i);
        fireEvent.click(confirmButton);
        expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when the Cancel button is clicked', () => {
        const handleCancel = vi.fn();
        render(<ConfirmDialog message="Are you sure?" onConfirm={() => {}} onCancel={handleCancel} />);
        const cancelButton = screen.getByText(/Cancel/i);
        fireEvent.click(cancelButton);
        expect(handleCancel).toHaveBeenCalledTimes(1);
    });
});