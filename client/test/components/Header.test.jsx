import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from '../../src/components/Header';
import React from 'react';

describe('Header Component', () => {
    it('renders correctly', () => {
        render(
            <Router>
                <Header toggleSidebar={() => {}} />
            </Router>
        );
        const logoElement = screen.getByAltText(/Kho Veterinary Clinic Logo/i);
        expect(logoElement).toBeInTheDocument();
        const headerTextElement = screen.getByText(/KHO VETERINARY CLINIC/i);
        expect(headerTextElement).toBeInTheDocument();
        const logoutTextElement = screen.getByText(/LOG OUT/i);
        expect(logoutTextElement).toBeInTheDocument();
    });

    it('calls toggleSidebar when the burger menu button is clicked', () => {
        const handleToggleSidebar = vi.fn();
        render(
            <Router>
                <Header toggleSidebar={handleToggleSidebar} />
            </Router>
        );
        const burgerMenuButton = screen.getByRole('button', { name: /menu/i });
        fireEvent.click(burgerMenuButton);
        expect(handleToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('renders the logout link correctly', () => {
        render(
            <Router>
                <Header toggleSidebar={() => {}} />
            </Router>
        );
        const logoutLink = screen.getByRole('link', { name: /log out/i });
        expect(logoutLink).toHaveAttribute('href', '/');
    });
});