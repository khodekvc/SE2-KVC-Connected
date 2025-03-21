import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FormGroup from '../../src/components/FormGroup';
import React from 'react';

describe('FormGroup Component', () => {
    it('renders correctly with the provided props', () => {
        render(
            <FormGroup
                label="Username"
                type="text"
                name="username"
                value="testuser"
                onChange={() => {}}
                required={true}
            />
        );
        const labelElement = screen.getByLabelText(/Username/i);
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).toHaveAttribute('type', 'text');
        expect(labelElement).toHaveAttribute('value', 'testuser');
        expect(labelElement).toBeRequired();
    });

    it('calls onChange when the input value changes', () => {
        const handleChange = vi.fn();
        render(
            <FormGroup
                label="Username"
                type="text"
                name="username"
                value=""
                onChange={handleChange}
                required={true}
            />
        );
        const inputElement = screen.getByLabelText(/Username/i);
        fireEvent.change(inputElement, { target: { value: 'newuser' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('displays the required asterisk when the field is required', () => {
        render(
            <FormGroup
                label="Username"
                type="text"
                name="username"
                value=""
                onChange={() => {}}
                required={true}
            />
        );
        const labelElement = screen.getByText(/Username \*/i);
        expect(labelElement).toBeInTheDocument();
    });

    it('does not display the required asterisk when the field is not required', () => {
        render(
            <FormGroup
                label="Username"
                type="text"
                name="username"
                value=""
                onChange={() => {}}
                required={false}
            />
        );
        const labelElement = screen.getByText(/Username/i);
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).not.toHaveTextContent('*');
    });
});