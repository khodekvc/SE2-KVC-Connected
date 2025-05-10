import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MedicalRecordForm from '../../src/components/MedicalRecordForm';
import React from 'react';

describe('MedicalRecordForm Component', () => {
    const formData = {
        weight: '',
        temperature: '',
        conditions: '',
        symptoms: '',
        laboratories: '',
        file: null,
        hadSurgery: false,
        surgeryDate: '',
        surgeryType: '',
        latestDiagnosis: '',
        recentVisit: '',
        recentPurchase: '',
        purposeOfVisit: '',
    };

    const errors = {};

    it('renders correctly with the provided props', () => {
        render(
            <MedicalRecordForm
                formData={formData}
                isEditing={true}
                isDiagnosisLocked={false}
                onInputChange={() => {}}
                onUnlockDiagnosis={() => {}}
                isAddRecord={false}
                errors={errors}
            />
        );
        const weightInput = screen.getByLabelText(/Weight/i);
        expect(weightInput).toBeInTheDocument();
        const temperatureInput = screen.getByLabelText(/Temperature/i);
        expect(temperatureInput).toBeInTheDocument();
        const conditionsInput = screen.getByLabelText(/Conditions/i);
        expect(conditionsInput).toBeInTheDocument();
        const symptomsInput = screen.getByLabelText(/Symptoms/i);
        expect(symptomsInput).toBeInTheDocument();
        const laboratoriesSelect = screen.getByLabelText(/Laboratories/i);
        expect(laboratoriesSelect).toBeInTheDocument();
        const fileInput = screen.getByLabelText(/File/i);
        expect(fileInput).toBeInTheDocument();
        const hadSurgeryYesRadio = screen.getByLabelText(/Yes/i);
        expect(hadSurgeryYesRadio).toBeInTheDocument();
        const hadSurgeryNoRadio = screen.getByLabelText(/Had past surgeries/i).nextSibling.querySelector('input[value="false"]');
        expect(hadSurgeryNoRadio).toBeInTheDocument();
        const latestDiagnosisTextarea = screen.getByLabelText(/Latest Diagnosis/i);
        expect(latestDiagnosisTextarea).toBeInTheDocument();
        const recentVisitInput = screen.getByLabelText(/Recent Visit/i);
        expect(recentVisitInput).toBeInTheDocument();
        const recentPurchaseInput = screen.getByLabelText(/Recent Purchase/i);
        expect(recentPurchaseInput).toBeInTheDocument();
        const purposeOfVisitInput = screen.getByLabelText(/Purpose of Visit/i);
        expect(purposeOfVisitInput).toBeInTheDocument();
    });

    it('calls onInputChange when input values change', () => {
        const handleInputChange = vi.fn();
        render(
            <MedicalRecordForm
                formData={formData}
                isEditing={true}
                isDiagnosisLocked={false}
                onInputChange={handleInputChange}
                onUnlockDiagnosis={() => {}}
                isAddRecord={false}
                errors={errors}
            />
        );
        const weightInput = screen.getByLabelText(/Weight/i);
        fireEvent.change(weightInput, { target: { value: '10' } });
        expect(handleInputChange).toHaveBeenCalledTimes(1);
    });

    it('calls onUnlockDiagnosis when the unlock diagnosis button is clicked', () => {
        const handleUnlockDiagnosis = vi.fn();
        render(
            <MedicalRecordForm
                formData={{ ...formData, latestDiagnosis: 'Test Diagnosis' }}
                isEditing={true}
                isDiagnosisLocked={true}
                onInputChange={() => {}}
                onUnlockDiagnosis={handleUnlockDiagnosis}
                isAddRecord={false}
                errors={errors}
            />
        );
        const unlockButton = screen.getByRole('button', { name: /Unlock Diagnosis/i });
        fireEvent.click(unlockButton);
        expect(handleUnlockDiagnosis).toHaveBeenCalledTimes(1);
    });
});