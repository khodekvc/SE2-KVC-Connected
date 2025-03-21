import { describe, it, expect, vi} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Button } from '../../src/components/Button';
import React from 'react';

describe('Button Component', () => {
    it('renders correctly', () => {
        render(
            <Router>
                <Button to="/test" buttonStyle="btn--primary" buttonSize="btn--medium">
                    Test Button
                </Button>
            </Router>
        );
        const buttonElement = screen.getByText(/Test Button/i);
        expect(buttonElement).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(
            <Router>
                <Button to="/test" buttonStyle="btn--primary" buttonSize="btn--medium" onClick={handleClick}>
                    Test Button
                </Button>
            </Router>
        );
        const buttonElement = screen.getByText(/Test Button/i);
        fireEvent.click(buttonElement);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('displays the correct label', () => {
        render(
            <Router>
                <Button to="/test" buttonStyle="btn--primary" buttonSize="btn--medium">
                    Correct Label
                </Button>
            </Router>
        );
        const buttonElement = screen.getByText(/Correct Label/i);
        expect(buttonElement).toBeInTheDocument();
    });

    it('applies the correct styles', () => {
        render(
            <Router>
                <Button to="/test" buttonStyle="btn--secondary" buttonSize="btn--large">
                    Styled Button
                </Button>
            </Router>
        );
        const buttonElement = screen.getByText(/Styled Button/i);
        expect(buttonElement).toHaveClass('btn btn--secondary btn--large');
    });

    it('falls back to default styles if invalid styles are provided', () => {
        render(
            <Router>
                <Button to="/test" buttonStyle="invalid-style" buttonSize="invalid-size">
                    Default Styled Button
                </Button>
            </Router>
        );
        const buttonElement = screen.getByText(/Default Styled Button/i);
        expect(buttonElement).toHaveClass('btn btn--primary btn--medium');
    });
});